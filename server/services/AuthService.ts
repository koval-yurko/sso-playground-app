import type { SettingsRepository } from '~~/types/SettingsRepository'
import type { UsersRepository } from '~~/types/UsersRepository'
import type { UserSessionsRepository } from '~~/types/UserSessionsRepository'
import { SettingTypes, type OpenIDSettings } from '~~/types/Settings'
import { useRuntimeConfig } from '#imports'
import { createVerify } from 'node:crypto'

export interface OpenIdLoginResult {
  authorizationUrl: string
  state: string
}

export interface OpenIdCallbackResult {
  tokens: {
    accessToken: string
    idToken: string
    tokenType: string
    expiresIn: number
    refreshToken?: string
  }
  sessionId: string
  userInfo: Record<string, unknown>
  issuer: string
}

interface AccessTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
}

type UserInfoResponse = Record<string, unknown>

type OpenIdDiscoveryDocument = {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  issuer: string
  jwks_uri: string
}

type SAMLMetadataDocument = {
  ssoUrl: string
  certificate: string
}

export interface SAMLLoginResult {
  authorizationUrl: string
}

export interface SAMLCallbackResult {
  sessionId: string
  userInfo: Record<string, unknown>
  nameId: string
}

export class AuthService {
  private settingsRepository: SettingsRepository
  private usersRepository: UsersRepository
  private userSessionsRepository: UserSessionsRepository

  constructor(settingsRepository: SettingsRepository, usersRepository: UsersRepository, userSessionsRepository: UserSessionsRepository) {
    this.settingsRepository = settingsRepository
    this.usersRepository = usersRepository
    this.userSessionsRepository = userSessionsRepository
  }

  async handleOpenIdLogin(key: string): Promise<OpenIdLoginResult> {
    const setting = await this.settingsRepository.getByKey(key)

    if (!setting || !setting.enabled || setting.type !== SettingTypes.OPEN_ID) {
      throw new Error(`OpenID setting with key "${key}" not found or not enabled`)
    }

    if (!setting.discoveryEndpoint || !setting.clientId) {
      throw new Error('OpenID configuration is incomplete')
    }

    const discoveryDoc = await this.getOpenIdDiscoveryDocument(setting.discoveryEndpoint)
    const callbackUrl = this.getOpenIdCallbackUrl(key)

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Build authorization URL
    const authUrl = new URL(discoveryDoc.authorization_endpoint)
    authUrl.searchParams.set('client_id', setting.clientId)
    authUrl.searchParams.set('redirect_uri', callbackUrl)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid profile email offline_access')
    authUrl.searchParams.set('state', state)

    if (setting.prompt) {
      authUrl.searchParams.set('prompt', setting.prompt)
    }

    return {
      authorizationUrl: authUrl.toString(),
      state,
    }
  }

  async handleOpenIdCallback(key: string, code: string): Promise<OpenIdCallbackResult> {
    const setting = await this.settingsRepository.getByKey(key)

    if (!setting || !setting.enabled || setting.type !== SettingTypes.OPEN_ID) {
      throw new Error(`OpenID setting with key "${key}" not found or not enabled`)
    }

    if (!setting.discoveryEndpoint || !setting.clientId || !setting.clientSecret) {
      throw new Error('OpenID configuration is incomplete')
    }

    const discoveryDoc = await this.getOpenIdDiscoveryDocument(setting.discoveryEndpoint)

    const tokenResponse = await this.getOpenIdAccessToken(setting, code, discoveryDoc.token_endpoint)

    const userInfo = await this.getOpenIdUserInfo(tokenResponse.access_token, discoveryDoc.userinfo_endpoint)

    const user = await this.usersRepository.createOrUpdate({
      email: userInfo.email as string,
      blocked: false,
    })

    const session = await this.userSessionsRepository.createOrUpdate({
      settingType: setting.type,
      settingKey: setting.key,
      userId: user.id,
      userEmail: user.email,
      accessToken: tokenResponse.access_token,
      idToken: tokenResponse.id_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      refreshToken: tokenResponse.refresh_token,
    })

    return {
      tokens: {
        accessToken: tokenResponse.access_token,
        idToken: tokenResponse.id_token,
        tokenType: tokenResponse.token_type,
        expiresIn: tokenResponse.expires_in,
        refreshToken: tokenResponse.refresh_token,
      },
      sessionId: session.id,
      userInfo,
      issuer: discoveryDoc.issuer,
    }
  }

  async handleSAMLLogin(key: string): Promise<SAMLLoginResult> {
    const setting = await this.settingsRepository.getByKey(key)

    if (!setting || !setting.enabled || setting.type !== SettingTypes.SAML) {
      throw new Error(`SAML setting with key "${key}" not found or not enabled`)
    }

    if (!setting.metadataURL) {
      throw new Error('SAML configuration is incomplete')
    }

    const callbackUrl = this.getSAMLCallbackUrl(key)
    const issuer = this.getSAMLIssuer()

    const metadataDocument = await this.getSAMLMetadataDocument(setting.metadataURL)

    // Generate SAML AuthnRequest
    const authnRequest = this.generateSAMLAuthnRequest(callbackUrl, issuer)

    const compressedRequest = deflateRaw(authnRequest)
    const encodedRequest = base64Encode(compressedRequest)

    // Build authorization URL
    // NOTE: Request is not signed. To add signing for IdPs that require it:
    // 1. Add SigAlg parameter (e.g., http://www.w3.org/2001/04/xmldsig-more#rsa-sha256)
    // 2. Sign the query string "SAMLRequest=<encoded>&SigAlg=<alg>" with private key
    // 3. Append &Signature=<base64_signature> to the URL
    const authorizationUrl = `${metadataDocument.ssoUrl}?SAMLRequest=${encodeURIComponent(encodedRequest)}`

    return {
      authorizationUrl,
    }
  }

  async handleSAMLCallback(key: string, samlResponse: string): Promise<SAMLCallbackResult> {
    const setting = await this.settingsRepository.getByKey(key)

    if (!setting || !setting.enabled || setting.type !== SettingTypes.SAML) {
      throw new Error(`SAML setting with key "${key}" not found or not enabled`)
    }

    if (!setting.metadataURL) {
      throw new Error('SAML configuration is incomplete')
    }

    // Decode the base64-encoded SAML response
    const decodedResponse = base64Decode(samlResponse)

    const medatataDocument = await this.getSAMLMetadataDocument(setting.metadataURL)

    // Validate SAML response signature using IdP certificate
    const isSignatureValid = await this.validateSAMLResponseSignature(decodedResponse, medatataDocument.certificate)

    if (!isSignatureValid) {
      throw new Error('SAML response signature validation failed')
    }

    // Parse the SAML response to extract user info
    const userInfo = this.parseSAMLResponse(decodedResponse)

    // Extract email from NameID or attributes
    const email = userInfo.nameId || userInfo.email as string

    if (!email) {
      throw new Error('No email found in SAML response')
    }

    // Create or update user
    const user = await this.usersRepository.createOrUpdate({
      email,
      blocked: false,
    })

    // Create session - SAML doesn't have traditional access/refresh tokens
    // Store the NameID as a reference
    const session = await this.userSessionsRepository.createOrUpdate({
      settingType: setting.type,
      settingKey: setting.key,
      userId: user.id,
      userEmail: user.email,
      accessToken: userInfo.nameId, // Store NameID as identifier
      idToken: userInfo.nameId,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours default
      refreshToken: undefined,
    })

    return {
      sessionId: session.id,
      userInfo,
      nameId: userInfo.nameId,
    }
  }

  async handleLogout(sessionId: string): Promise<void> {
    try {
      await this.userSessionsRepository.delete(sessionId)
    }
    catch (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }

  async getValidSession(sessionId: string | undefined) {
    if (!sessionId) {
      return null
    }
    const session = await this.userSessionsRepository.getBySessionId(sessionId)

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

    return session
  }

  private getOpenIdCallbackUrl(key: string): string {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl
    return `${baseUrl}/api/auth/openid/${key}/callback`
  }

  private async getOpenIdDiscoveryDocument(discoveryEndpoint: string): Promise<OpenIdDiscoveryDocument> {
    return await $fetch<OpenIdDiscoveryDocument>(discoveryEndpoint)
  }

  private async getOpenIdAccessToken(setting: OpenIDSettings, code: string, tokenEndpoint: string): Promise<AccessTokenResponse> {
    const redirectUri = this.getOpenIdCallbackUrl(setting.key)

    // Exchange authorization code for tokens
    const accessToken = await $fetch<AccessTokenResponse>(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: setting.clientId!,
        client_secret: setting.clientSecret!,
      }).toString(),
    })

    return accessToken
  }

  private async getOpenIdUserInfo(accessToken: string, userinfoEndpoint: string): Promise<UserInfoResponse> {
    return await $fetch<UserInfoResponse>(userinfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  private getSAMLCallbackUrl(key: string): string {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl
    return `${baseUrl}/api/auth/saml/${key}/callback`
  }

  private getSAMLIssuer(): string {
    const config = useRuntimeConfig()
    return config.public.baseUrl
  }

  private async getSAMLMetadataDocument(metadataURL: string): Promise<SAMLMetadataDocument> {
    const metadata = await $fetch<string>(metadataURL, {
      headers: {
        Accept: 'application/xml, text/xml',
      },
    })

    const ssoUrlMatch = metadata.match(
      /<SingleSignOnService[^>]*Binding="urn:oasis:names:tc:SAML:2\.0:bindings:HTTP-Redirect"[^>]*Location="([^"]+)"/,
    )
      || metadata.match(
        /<SingleSignOnService[^>]*Location="([^"]+)"[^>]*Binding="urn:oasis:names:tc:SAML:2\.0:bindings:HTTP-Redirect"/,
      )

    if (!ssoUrlMatch || !ssoUrlMatch[1]) {
      throw new Error('Could not find SSO URL in IdP metadata')
    }

    const certMatch = metadata.match(
      /<KeyDescriptor[^>]*use="signing"[^>]*>[\s\S]*?<X509Certificate[^>]*>([^<]+)<\/X509Certificate>/,
    )
      || metadata.match(
        /<X509Certificate[^>]*>([^<]+)<\/X509Certificate>/,
      )

    if (!certMatch || !certMatch[1]) {
      throw new Error('Could not find X.509 certificate in IdP metadata')
    }

    // Certificate content (remove whitespace/newlines)
    const certContent = certMatch[1].replace(/\s+/g, '')

    // Format as PEM certificate
    const certificate = `-----BEGIN CERTIFICATE-----\n${certContent.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`

    return {
      certificate,
      ssoUrl: ssoUrlMatch[1],
    }
  }

  private generateSAMLAuthnRequest(callbackUrl: string, issuer: string): string {
    const requestId = `_${crypto.randomUUID()}`
    const issueInstant = new Date().toISOString()

    // Generate SAML AuthnRequest XML
    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${requestId}"
  Version="2.0"
  IssueInstant="${issueInstant}"
  AssertionConsumerServiceURL="${callbackUrl}"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
>
  <saml:Issuer>${issuer}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>`
  }

  private parseSAMLResponse(responseXml: string): Record<string, unknown> & { nameId: string } {
    // Simple regex-based XML parsing to extract user information
    // NOTE: This is a basic implementation. For production use with complex responses,
    // consider using an XML parser library

    // Extract NameID (typically the user's email or unique identifier)
    const nameIdMatch = responseXml.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/)
      || responseXml.match(/<NameID[^>]*>([^<]+)<\/NameID>/)
    const nameId = nameIdMatch?.[1] || ''

    // Extract attributes from AttributeStatement
    const attributes: Record<string, unknown> = { nameId }

    // Parse attribute values (looking for common attributes like email, name, etc.)
    const attributeRegex = /<saml:Attribute[^>]*Name="([^"]+)"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/g
    const attributeRegexAlt = /<Attribute[^>]*Name="([^"]+)"[^>]*>[\s\S]*?<AttributeValue[^>]*>([^<]+)<\/AttributeValue>/g

    let match
    while ((match = attributeRegex.exec(responseXml)) !== null) {
      const [, name, value] = match
      // Normalize attribute names (remove namespaces, convert to camelCase)
      const normalizedName = name.split('/').pop()?.toLowerCase() || name
      attributes[normalizedName] = value
    }

    // Try alternate pattern if no attributes found
    if (Object.keys(attributes).length === 1) {
      while ((match = attributeRegexAlt.exec(responseXml)) !== null) {
        const [, name, value] = match
        const normalizedName = name.split('/').pop()?.toLowerCase() || name
        attributes[normalizedName] = value
      }
    }

    return attributes as Record<string, unknown> & { nameId: string }
  }

  private async validateSAMLResponseSignature(responseXml: string, certificate: string): Promise<boolean> {
    // Extract the signature value from the response
    const signatureValueMatch = responseXml.match(/<SignatureValue[^>]*>([^<]+)<\/SignatureValue>/)
      || responseXml.match(/<ds:SignatureValue[^>]*>([^<]+)<\/ds:SignatureValue>/)

    if (!signatureValueMatch) {
      // No signature found in response
      return false
    }

    const signatureValue = signatureValueMatch[1].replace(/\s+/g, '')

    // Extract the signed info (the canonicalized SignedInfo element)
    // NOTE: This is a simplified approach. Proper SAML validation requires
    // XML Canonicalization (C14N) which is complex without a library
    const signedInfoMatch = responseXml.match(/<SignedInfo[^>]*>([\s\S]*?)<\/SignedInfo>/)
      || responseXml.match(/<ds:SignedInfo[^>]*>([\s\S]*?)<\/ds:SignedInfo>/)

    if (!signedInfoMatch) {
      throw new Error('Could not find SignedInfo in SAML response')
    }

    // Reconstruct the SignedInfo element with namespace
    const signedInfo = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${signedInfoMatch[1]}</ds:SignedInfo>`

    // Simple canonicalization: remove extra whitespace between tags
    const canonicalSignedInfo = signedInfo
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim()

    try {
      // Create a verifier with the certificate
      const verify = createVerify('RSA-SHA256')
      verify.update(canonicalSignedInfo)

      // Verify the signature
      const isValid = verify.verify(certificate, signatureValue, 'base64')

      return isValid
    }
    catch (error) {
      console.error('Signature validation error:', error)
      return false
    }
  }
}

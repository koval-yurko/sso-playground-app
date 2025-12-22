import { SAML } from '@node-saml/node-saml'
import type { SettingsRepository } from '~~/types/SettingsRepository'
import type { UsersRepository } from '~~/types/UsersRepository'
import type { UserSessionsRepository } from '~~/types/UserSessionsRepository'
import { SettingTypes, type OpenIDSettings } from '~~/types/Settings'
import { useRuntimeConfig } from '#imports'

export interface OpenIdLoginResult {
  authorizationUrl: string
  state: string
}

export interface OpenIdCallbackResult {
  sessionId: string
  userInfo: Record<string, unknown>
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
      sessionId: session.id,
      userInfo,
    }
  }

  async handleSAMLMetadata(key: string): Promise<string> {
    const setting = await this.settingsRepository.getByKey(key)

    if (!setting || !setting.enabled || setting.type !== SettingTypes.SAML) {
      throw new Error(`SAML setting with key "${key}" not found or not enabled`)
    }

    if (!setting.metadataURL) {
      throw new Error('SAML configuration is incomplete')
    }

    const saml = await this.getSAMLConfiguration(key, setting.metadataURL)

    return saml.generateServiceProviderMetadata(null)
  }

  async handleSAMLLogin(key: string): Promise<SAMLLoginResult> {
    const setting = await this.settingsRepository.getByKey(key)

    if (!setting || !setting.enabled || setting.type !== SettingTypes.SAML) {
      throw new Error(`SAML setting with key "${key}" not found or not enabled`)
    }

    if (!setting.metadataURL) {
      throw new Error('SAML configuration is incomplete')
    }

    const saml = await this.getSAMLConfiguration(key, setting.metadataURL)

    const authorizationUrl = await saml.getAuthorizeUrlAsync('', '', {})

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

    const saml = await this.getSAMLConfiguration(key, setting.metadataURL)

    // Validate and parse SAML response
    const { profile } = await saml.validatePostResponseAsync({ SAMLResponse: samlResponse })

    if (!profile) {
      throw new Error('Failed to parse SAML response')
    }

    // Extract email from NameID or attributes
    const email = profile.nameID || profile.email as string || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string

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
    })

    return {
      sessionId: session.id,
      userInfo: profile as unknown as Record<string, unknown>,
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

    if (!session || (session.expiresAt && session.expiresAt < Date.now())) {
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

  private getSAMLMetadataUrl(key: string): string {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl
    return `${baseUrl}/api/auth/saml/${key}/metadata`
  }

  private async getSAMLConfiguration(key: string, metadataURL: string): Promise<SAML> {
    const metadataDocument = await this.parseSAMLMetadataDocument(metadataURL)
    const callbackUrl = this.getSAMLCallbackUrl(key)
    const metadataUrl = this.getSAMLMetadataUrl(key)
    const issuer = this.getSAMLIssuer()

    // Create SAML instance with configuration
    const saml = new SAML({
      callbackUrl,
      issuer,
      audience: metadataUrl, // Set audience to metadata URL to match IdP expectations
      idpCert: metadataDocument.certificate,
      entryPoint: metadataDocument.ssoUrl,
      wantAuthnResponseSigned: true,
      wantAssertionsSigned: false,
      acceptedClockSkewMs: -1,
    })

    return saml
  }

  private async parseSAMLMetadataDocument(metadataURL: string): Promise<SAMLMetadataDocument> {
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
}

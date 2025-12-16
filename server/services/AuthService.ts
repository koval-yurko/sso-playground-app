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
    const redirectUri = this.getOpenIdRedirectUri(key)

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Build authorization URL
    const authUrl = new URL(discoveryDoc.authorization_endpoint)
    authUrl.searchParams.set('client_id', setting.clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
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

  private getOpenIdRedirectUri(key: string): string {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl
    return `${baseUrl}/api/auth/openid/${key}/callback`
  }

  private async getOpenIdDiscoveryDocument(discoveryEndpoint: string) {
    return await $fetch<OpenIdDiscoveryDocument>(discoveryEndpoint)
  }

  private async getOpenIdAccessToken(setting: OpenIDSettings, code: string, tokenEndpoint: string): Promise<AccessTokenResponse> {
    const redirectUri = this.getOpenIdRedirectUri(setting.key)

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

}

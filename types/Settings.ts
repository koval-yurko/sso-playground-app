export const SettingTypes = {
  OPEN_ID: 'openid',
  SAML: 'saml',
} as const

export type SettingType = (typeof SettingTypes)[keyof typeof SettingTypes];

export type SettingId = string;

interface SettingsBase {
  id: SettingId
  type: SettingType
  name: string
  key: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type Settings = OpenIDSettings | SAMLSettings;

export interface OpenIDSettings extends SettingsBase {
  type: 'openid';
  discoveryEndpoint?: string;
  clientId?: string;
  clientSecret?: string;
  prompt?: string;
}

export interface OpenIDSettingsCreateDTO extends Omit<OpenIDSettings, 'id' | 'key' | 'createdAt' | 'updatedAt'> {
  key?: string
}

export type OpenIDSettingsUpdateDTO = Partial<Omit<OpenIDSettings, 'id' | 'createdAt' | 'updatedAt'>>


export interface SAMLSettings extends SettingsBase {
  type: 'saml';
  metadataURL?: string;
}

export interface SAMLSettingsCreateDTO extends Omit<SAMLSettings, 'id' | 'key' | 'createdAt' | 'updatedAt'> {
  key?: string
}

export type SAMLSettingsUpdateDTO = Partial<Omit<SAMLSettings, 'id' | 'createdAt' | 'updatedAt'>>

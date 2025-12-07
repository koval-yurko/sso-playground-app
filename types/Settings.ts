export const SettingTypes = {
  OPEN_ID: 'openid',
  SAML: 'saml',
} as const

export type SettingType = (typeof SettingTypes)[keyof typeof SettingTypes];

export type SettingId = string;

interface SettingsBase {
  type: SettingType
  name: string
  key: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Settings extends SettingsBase {
  id: SettingId
}

export interface SettingsCreateDTO extends Omit<SettingsBase, 'key' | 'createdAt' | 'updatedAt'> {
  key?: string
}

export type SettingsUpdateDTO = Partial<Omit<SettingsBase, 'createdAt' | 'updatedAt'>>


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
}

export interface Settings extends SettingsBase {
  id: SettingId
}

export interface SettingsCreateDTO extends Omit<SettingsBase, 'key'> {
  key?: string
}

export type SettingsUpdateDTO = Partial<SettingsBase>


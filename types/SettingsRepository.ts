import type { Settings, SettingId, SettingsCreateDTO, SettingsUpdateDTO, SettingType } from './Settings'

export interface SettingsRepository {
  getList(type: SettingType): Promise<Settings[]>
  create(data: SettingsCreateDTO): Promise<Settings>
  update(id: SettingId, data: SettingsUpdateDTO): Promise<Settings>
  delete(id: SettingId): Promise<Settings>
}

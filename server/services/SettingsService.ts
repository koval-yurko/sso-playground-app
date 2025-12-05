import type { SettingsRepository } from '~~/types/SettingsRepository'
import type { SettingType, SettingId, SettingsCreateDTO, SettingsUpdateDTO } from '~~/types/Settings'

export class SettingsService {
  private settingsRepository: SettingsRepository

  constructor(settingsRepository: SettingsRepository) {
    this.settingsRepository = settingsRepository
  }

  getList(type: SettingType) {
    return this.settingsRepository.getList(type)
  }

  create(data: SettingsCreateDTO) {
    return this.settingsRepository.create(data)
  }

  update(id: SettingId, data: SettingsUpdateDTO) {
    return this.settingsRepository.update(id, data)
  }

  delete(id: SettingId) {
    return this.settingsRepository.delete(id)
  }
}

import type { SettingsRepository } from '~~/types/SettingsRepository'
import type { SettingType, SettingId, SettingsCreateDTO, SettingsUpdateDTO } from '~~/types/Settings'
import {useRuntimeConfig} from '#imports'

export type EnabledLoginMethod = {
  type: SettingType
  name: string
  loginUrl: string
}

export class SettingsService {
  private settingsRepository: SettingsRepository

  constructor(settingsRepository: SettingsRepository) {
    this.settingsRepository = settingsRepository
  }

  getList(type: SettingType) {
    return this.settingsRepository.getList(type)
  }

  getByKey(key: string) {
    return this.settingsRepository.getByKey(key)
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

  async getEnabledMethods() {
    const enabled = await this.settingsRepository.getEnabled()
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl

    return enabled.map(setting => ({
      type: setting.type,
      name: setting.name,
      loginUrl: `${baseUrl}/api/auth/${setting.type}/${setting.key}/login`,
    }))
  }
}

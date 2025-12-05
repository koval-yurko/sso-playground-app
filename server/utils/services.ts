import { FirestoreSettingsRepository } from '../repositories/FirestoreSettingsRepository'
import { SettingsService } from '../services/SettingsService'

let settingsServiceInstance: SettingsService | null = null

export function useSettingsService(): SettingsService {
  if (!settingsServiceInstance) {
    const repository = new FirestoreSettingsRepository()
    settingsServiceInstance = new SettingsService(repository)
  }
  return settingsServiceInstance
}
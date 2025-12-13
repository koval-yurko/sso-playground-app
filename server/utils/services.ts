import { FirestoreSettingsRepository } from '../repositories/FirestoreSettingsRepository'
import { FirestoreUsersRepository } from '../repositories/FirestoreUsersRepository'
import { SettingsService } from '../services/SettingsService'
import { AuthService } from '../services/AuthService'

let settingsServiceInstance: SettingsService | null = null
let authServiceInstance: AuthService | null = null

export function useSettingsService(): SettingsService {
  if (!settingsServiceInstance) {
    const settingsRepository = new FirestoreSettingsRepository()
    settingsServiceInstance = new SettingsService(settingsRepository)
  }
  return settingsServiceInstance
}

export function useAuthService(): AuthService {
  if (!authServiceInstance) {
    const settingsRepository = new FirestoreSettingsRepository()
    const usersRepository = new FirestoreUsersRepository()
    authServiceInstance = new AuthService(settingsRepository, usersRepository)
  }
  return authServiceInstance
}

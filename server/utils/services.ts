import { FirestoreSettingsRepository } from '../repositories/FirestoreSettingsRepository'
import { FirestoreUsersRepository } from '../repositories/FirestoreUsersRepository'
import { FirestoreUserSessionsRepository } from '../repositories/FirestoreUserSessionsRepository'
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
    const userSessionsRepository = new FirestoreUserSessionsRepository()
    authServiceInstance = new AuthService(settingsRepository, usersRepository, userSessionsRepository)
  }
  return authServiceInstance
}

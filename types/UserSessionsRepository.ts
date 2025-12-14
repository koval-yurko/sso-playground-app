import type { UserSession, UserSessionId, UserSessionCreateDTO } from './UserSession'

export interface UserSessionsRepository {
  getBySessionId(id: UserSessionId): Promise<UserSession | null>
  createOrUpdate(data: UserSessionCreateDTO): Promise<UserSession>
  delete(id: UserSessionId): Promise<UserSession>
}

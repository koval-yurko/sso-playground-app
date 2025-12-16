export type UserSessionId = string;

export interface UserSession {
  id: UserSessionId
  settingType: string;
  settingKey: string;
  userId: string
  userEmail: string
  accessToken: string
  idToken: string
  expiresAt: number
  refreshToken?: string
  createdAt: string
  updatedAt: string
}

export interface UserSessionCreateDTO extends Omit<UserSession, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string
}

export interface UserSessionUpdateDTO extends Omit<UserSession, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string
}

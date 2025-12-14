import type { User, UserId, UserCreateDTO } from './User'

export interface UsersRepository {
  getByEmail(email: string): Promise<User | null>
  createOrUpdate(data: UserCreateDTO): Promise<User>
  delete(id: UserId): Promise<User>
}

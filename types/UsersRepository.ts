import type { User, UserId, UserCreateDTO, UserUpdateDTO } from './User'

export interface UsersRepository {
  getById(id: UserId): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  create(data: UserCreateDTO): Promise<User>
  update(id: UserId, data: UserUpdateDTO): Promise<User>
  delete(id: UserId): Promise<User>
}

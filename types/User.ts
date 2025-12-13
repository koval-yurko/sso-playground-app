export type UserId = string;

export interface User {
  id: UserId
  email: string
  blocked: boolean
  createdAt: string
  updatedAt: string
}

export interface UserCreateDTO extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  email: string
}

export interface UserUpdateDTO extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  email: string
}

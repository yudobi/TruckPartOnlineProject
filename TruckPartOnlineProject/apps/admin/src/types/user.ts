// Users
export type UserId = number

export type User = {
  readonly id: UserId
  email: string
  username: string
  full_name: string
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UserForm = {
  email: string
  username?: string
  password?: string | null
  full_name: string
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
}
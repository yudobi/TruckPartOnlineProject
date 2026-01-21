export type User = {
  id: number
  email: string
  username: string
  full_name: string
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
}

export type LoginData = {
  token: string
  refresh: string
  user_info: User
}

export type AuthContextType = {
  user: User | null
  token: string | null
  login: (loginData: LoginData) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

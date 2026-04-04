export type AuthResponse = {
  id: string
  userName: string
  email: string
  roles: string[]
  isVerified: boolean
  jwToken: string
  refreshToken: string
}

export type AuthUser = {
  id: string
  userName: string
  email: string
  roles: string[]
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type AuthMutationResult = {
  ok: boolean
  message: string
}

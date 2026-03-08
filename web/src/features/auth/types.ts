export type AuthUser = {
  id: string
  userName: string
  email: string
  roles: string[]
  isVerified: boolean
  jWToken: string
}

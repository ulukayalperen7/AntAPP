import { apiFetchData } from '@/features/api/client'
import type { CurrentUser } from '@/features/api/types'

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiFetchData<CurrentUser>('/account/me')
}

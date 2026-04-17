import { apiFetchData } from '@/features/api/client'
import type { CurrentUser } from '@/features/api/types'

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiFetchData<CurrentUser>('/account/me')
}

export async function updateProfile(data: {
  userName?: string
  profilePhotoUrl?: string
}): Promise<void> {
  await apiFetchData<string>('/account/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<void> {
  await apiFetchData<string>('/account/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

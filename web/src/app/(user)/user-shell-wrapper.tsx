'use client'

import { Theme } from '@antapp/ui'
import { UserShell } from '@/components/user-shell'
import { logout } from '@/features/auth/actions'

export function UserShellWrapper({
  children,
  userId,
  userName,
  profilePhotoUrl,
  roles,
}: {
  children: React.ReactNode
  userId?: string
  userName?: string
  profilePhotoUrl?: string | null
  roles?: string[]
}) {
  return (
    <Theme name="user">
      <UserShell userId={userId} userName={userName} profilePhotoUrl={profilePhotoUrl} roles={roles} onLogout={() => logout()}>
        {children}
      </UserShell>
    </Theme>
  )
}

'use client'

import { Theme } from '@antapp/ui'
import { UserShell } from '@/components/user-shell'
import { logout } from '@/features/auth/actions'

export function UserShellWrapper({
  children,
  userId,
  userName,
  profilePhotoUrl,
}: {
  children: React.ReactNode
  userId?: string
  userName?: string
  profilePhotoUrl?: string | null
}) {
  return (
    <Theme name="user">
      <UserShell userId={userId} userName={userName} profilePhotoUrl={profilePhotoUrl} onLogout={() => logout()}>
        {children}
      </UserShell>
    </Theme>
  )
}

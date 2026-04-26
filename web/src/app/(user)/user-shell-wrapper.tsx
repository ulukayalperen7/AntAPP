'use client'

import { Theme } from '@antapp/ui'
import { UserShell } from '@/components/user-shell'
import { logout } from '@/features/auth/actions'

export function UserShellWrapper({
  children,
  userId,
  userName,
}: {
  children: React.ReactNode
  userId?: string
  userName?: string
}) {
  return (
    <Theme name="user">
      <UserShell userId={userId} userName={userName} onLogout={() => logout()}>
        {children}
      </UserShell>
    </Theme>
  )
}

'use client'

import { Theme } from '@antapp/ui'
import { UserShell } from '@/components/user-shell'
import { logout } from '@/features/auth/actions'

export function UserShellWrapper({
  children,
  userName,
}: {
  children: React.ReactNode
  userName?: string
}) {
  return (
    <Theme name="user">
      <UserShell userName={userName} onLogout={() => logout()}>
        {children}
      </UserShell>
    </Theme>
  )
}

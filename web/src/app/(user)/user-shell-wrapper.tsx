'use client'

import { Theme } from '@antapp/ui'
import { UserShell } from '@/components/user-shell'

export function UserShellWrapper({
  children,
  userName,
}: {
  children: React.ReactNode
  userName?: string
}) {
  return (
    <Theme name="user">
      <UserShell userName={userName}>{children}</UserShell>
    </Theme>
  )
}

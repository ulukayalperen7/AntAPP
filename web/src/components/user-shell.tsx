'use client'

import { XStack, YStack, ScrollView } from '@antapp/ui'
import { AppSidebar } from './app-sidebar'
import { AppTopBar } from './app-topbar'

export function UserShell({
  children,
  userName,
  onLogout,
}: {
  children: React.ReactNode
  userName?: string
  onLogout?: () => void
}) {
  return (
    <XStack flex={1} minHeight="100vh" backgroundColor="$background">
      <AppSidebar userName={userName} onLogout={onLogout} />
      <YStack flex={1}>
        <AppTopBar />
        <YStack flex={1} padding="$5" gap="$5">
          {children}
        </YStack>
      </YStack>
    </XStack>
  )
}

'use client'

import { useState } from 'react'
import { XStack, YStack } from '@antapp/ui'
import { AppSidebar, EXPANDED_WIDTH, COLLAPSED_WIDTH } from './app-sidebar'
import { AppTopBar } from './app-topbar'

export function UserShell({
  children,
  userId,
  userName,
  onLogout,
}: {
  children: React.ReactNode
  userId?: string
  userName?: string
  onLogout?: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH

  return (
    <XStack flex={1} minHeight="100vh" backgroundColor="$background">
      <AppSidebar
        userId={userId}
        userName={userName}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <YStack
        flex={1}
        // @ts-ignore web transition
        style={{ marginLeft: sidebarWidth, transition: 'margin-left 200ms ease' }}
        $md={{ marginLeft: 0 }}
      >
        <AppTopBar />
        <YStack flex={1} padding="$5" gap="$5">
          {children}
        </YStack>
      </YStack>
    </XStack>
  )
}

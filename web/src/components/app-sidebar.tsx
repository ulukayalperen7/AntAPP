'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { YStack, XStack, Text, Avatar, Divider } from '@antapp/ui'
import { useTheme } from 'tamagui'
import { Globe, Route, Bookmark, MapPinned, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Explore', href: '/dashboard', Icon: Globe },
  { label: 'Spots', href: '/spots', Icon: MapPinned },
  { label: 'My Routes', href: '/profile', Icon: Route },
  { label: 'Saved', href: '/saved', Icon: Bookmark },
]

const EXPANDED_WIDTH = 220
const COLLAPSED_WIDTH = 64

export function AppSidebar({
  userName,
  onLogout,
  collapsed,
  onToggle,
}: {
  userName?: string
  onLogout?: () => void
  collapsed?: boolean
  onToggle?: () => void
}) {
  const pathname = usePathname()
  const theme = useTheme()
  const activeNavIconColor = theme.primary?.get() ?? '#EA580C'
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH

  return (
    <YStack
      width={width}
      height="100vh"
      backgroundColor="$backgroundStrong"
      borderRightWidth={1}
      borderRightColor="$borderColor"
      paddingVertical="$4"
      justifyContent="space-between"
      position="fixed"
      top={0}
      left={0}
      zIndex={50}
      $md={{ display: 'none' }}
      // @ts-ignore web transition
      style={{ transition: 'width 200ms ease' }}
    >
      <YStack gap="$1">
        {/* Logo + Toggle */}
        <XStack
          paddingHorizontal={collapsed ? '$2' : '$4'}
          paddingBottom="$6"
          alignItems="center"
          justifyContent={collapsed ? 'center' : 'space-between'}
          gap="$2"
        >
          <XStack alignItems="center" gap="$2" overflow="hidden">
            <img src="/ant-logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
            {!collapsed && <Text variant="heading4" color="$color">AntAPP</Text>}
          </XStack>
          {onToggle && !collapsed && (
            <XStack
              cursor="pointer"
              onPress={onToggle}
              hoverStyle={{ opacity: 0.7 }}
              padding="$1"
            >
              <PanelLeftClose size={18} color="currentColor" />
            </XStack>
          )}
        </XStack>

        {/* Collapsed toggle button */}
        {onToggle && collapsed && (
          <XStack
            paddingHorizontal="$2"
            paddingBottom="$3"
            justifyContent="center"
          >
            <XStack
              cursor="pointer"
              onPress={onToggle}
              hoverStyle={{ opacity: 0.7 }}
              padding="$1"
            >
              <PanelLeftOpen size={18} color="currentColor" />
            </XStack>
          </XStack>
        )}

        {/* Nav Items */}
        <YStack gap="$0.5" paddingHorizontal="$2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <XStack
                  paddingHorizontal={collapsed ? '$0' : '$3'}
                  paddingVertical="$2.5"
                  borderRadius="$3"
                  gap="$2.5"
                  alignItems="center"
                  justifyContent={collapsed ? 'center' : 'flex-start'}
                  backgroundColor={isActive ? '$ant50' : 'transparent'}
                  hoverStyle={{ backgroundColor: isActive ? '$ant50' : '$backgroundHover' }}
                  cursor="pointer"
                >
                  <item.Icon size={20} color={isActive ? activeNavIconColor : 'currentColor'} strokeWidth={isActive ? 2.5 : 2} />
                  {!collapsed && (
                    <Text
                      variant="body"
                      weight={isActive ? 'semibold' : 'regular'}
                      color={isActive ? '$primary' : '$color'}
                    >
                      {item.label}
                    </Text>
                  )}
                </XStack>
              </Link>
            )
          })}
        </YStack>
      </YStack>

      {/* Bottom Section */}
      <YStack paddingHorizontal="$2" gap="$2">
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <XStack
            paddingHorizontal={collapsed ? '$0' : '$3'}
            paddingVertical="$2.5"
            borderRadius="$3"
            gap="$2.5"
            alignItems="center"
            justifyContent={collapsed ? 'center' : 'flex-start'}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            cursor="pointer"
          >
            <Settings size={20} color="currentColor" />
            {!collapsed && <Text variant="body" color="$mutedForeground">Settings</Text>}
          </XStack>
        </Link>

        <Divider marginHorizontal="$2" />

        <XStack
          paddingHorizontal={collapsed ? '$0' : '$3'}
          paddingVertical="$2"
          gap="$2.5"
          alignItems="center"
          justifyContent={collapsed ? 'center' : 'flex-start'}
        >
          <Avatar size="sm" initials={userName?.charAt(0)?.toUpperCase() ?? 'U'} />
          {!collapsed && (
            <YStack flex={1}>
              <Text variant="label" fontSize="$3" truncate>{userName ?? 'User'}</Text>
              <Text variant="caption" muted>Explorer</Text>
            </YStack>
          )}
        </XStack>

        {onLogout && (
          <XStack
            paddingHorizontal={collapsed ? '$0' : '$3'}
            paddingVertical="$2.5"
            borderRadius="$3"
            gap="$2.5"
            alignItems="center"
            justifyContent={collapsed ? 'center' : 'flex-start'}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            cursor="pointer"
            onPress={onLogout}
          >
            <LogOut size={18} color="var(--color-error500, #DC2626)" />
            {!collapsed && <Text variant="body" color="$error500" fontSize="$3">Sign Out</Text>}
          </XStack>
        )}
      </YStack>
    </YStack>
  )
}

export { EXPANDED_WIDTH, COLLAPSED_WIDTH }

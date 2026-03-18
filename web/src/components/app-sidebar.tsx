'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { YStack, XStack, Text, Avatar, Divider } from '@antapp/ui'
import { Globe, Route, Users, Bookmark, Settings, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Explore', href: '/', Icon: Globe },
  { label: 'My Routes', href: '/profile', Icon: Route },
  { label: 'Community', href: '/community', Icon: Users },
  { label: 'Saved', href: '/saved', Icon: Bookmark },
]

export function AppSidebar({ userName, onLogout }: { userName?: string; onLogout?: () => void }) {
  const pathname = usePathname()

  return (
    <YStack
      width={220}
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
    >
      <YStack gap="$1">
        <XStack paddingHorizontal="$4" paddingBottom="$6" alignItems="center" gap="$2">
          <XStack
            width={32}
            height={32}
            borderRadius="$full"
            backgroundColor="$primary"
            alignItems="center"
            justifyContent="center"
          >
            <img src="/ant-mascot.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          </XStack>
          <Text variant="heading4" color="$color">AntAPP</Text>
        </XStack>

        <YStack gap="$0.5" paddingHorizontal="$2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2.5"
                  borderRadius="$3"
                  gap="$2.5"
                  alignItems="center"
                  backgroundColor={isActive ? '$ant50' : 'transparent'}
                  hoverStyle={{ backgroundColor: isActive ? '$ant50' : '$backgroundHover' }}
                  cursor="pointer"
                >
                  <item.Icon size={20} color={isActive ? 'var(--color-primary)' : 'currentColor'} strokeWidth={isActive ? 2.5 : 2} />
                  <Text
                    variant="body"
                    weight={isActive ? 'semibold' : 'regular'}
                    color={isActive ? '$primary' : '$color'}
                  >
                    {item.label}
                  </Text>
                </XStack>
              </Link>
            )
          })}
        </YStack>
      </YStack>

      <YStack paddingHorizontal="$2" gap="$2">
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$2.5"
            borderRadius="$3"
            gap="$2.5"
            alignItems="center"
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            cursor="pointer"
          >
            <Settings size={20} color="currentColor" />
            <Text variant="body" color="$mutedForeground">Settings</Text>
          </XStack>
        </Link>

        <Divider marginHorizontal="$2" />

        <XStack paddingHorizontal="$3" paddingVertical="$2" gap="$2.5" alignItems="center">
          <Avatar size="sm" initials={userName?.charAt(0)?.toUpperCase() ?? 'U'} />
          <YStack flex={1}>
            <Text variant="label" fontSize="$3" truncate>{userName ?? 'User'}</Text>
            <Text variant="caption" muted>Explorer</Text>
          </YStack>
        </XStack>

        {onLogout && (
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$2.5"
            borderRadius="$3"
            gap="$2.5"
            alignItems="center"
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            cursor="pointer"
            onPress={onLogout}
          >
            <LogOut size={18} color="var(--color-error500, #DC2626)" />
            <Text variant="body" color="$error500" fontSize="$3">Sign Out</Text>
          </XStack>
        )}
      </YStack>
    </YStack>
  )
}

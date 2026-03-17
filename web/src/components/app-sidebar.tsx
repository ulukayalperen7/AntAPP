'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { YStack, XStack, Text, Avatar, Divider } from '@antapp/ui'

const NAV_ITEMS = [
  { label: 'Explore', href: '/', icon: '\u{1F30D}' },
  { label: 'My Routes', href: '/profile', icon: '\u{1F6A9}' },
  { label: 'Community', href: '/community', icon: '\u{1F465}' },
  { label: 'Saved', href: '/saved', icon: '\u{1F516}' },
]

export function AppSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname()

  return (
    <YStack
      width={220}
      minHeight="100vh"
      backgroundColor="$backgroundStrong"
      borderRightWidth={1}
      borderRightColor="$borderColor"
      paddingVertical="$4"
      justifyContent="space-between"
      position="sticky"
      top={0}
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
            <Text variant="label" color="#FFFFFF" fontSize="$3">{'\u{1F41C}'}</Text>
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
                  <Text fontSize="$5">{item.icon}</Text>
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
            <Text fontSize="$5">{'\u2699\uFE0F'}</Text>
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
      </YStack>
    </YStack>
  )
}

import { usePathname, useRouter } from 'expo-router'
import React from 'react'
import { HStack, Text, YStack } from '@antapp/ui'
import { Feather } from '@expo/vector-icons'

type TabItem = {
  route: string
  label: string
  icon: React.ComponentProps<typeof Feather>['name']
}

const TABS: TabItem[] = [
  { route: '/', label: 'Home', icon: 'home' },
  { route: '/explore', label: 'Explore', icon: 'compass' },
  { route: '/spots', label: 'Spots', icon: 'map-pin' },
  { route: '/create', label: 'Create', icon: 'plus-circle' },
  { route: '/profile', label: 'Profile', icon: 'user' },
]

const TAB_ROUTES = new Set(TABS.map((tab) => tab.route))

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const isTabRoute = pathname === '/' || TAB_ROUTES.has(pathname)
  if (!isTabRoute) return null

  return (
    <HStack
      position="fixed"
      bottom={20}
      left={20}
      right={20}
      backgroundColor="rgba(255,255,255,0.92)"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$full"
      justifyContent="space-between"
      alignItems="center"
      paddingHorizontal="$2"
      paddingVertical="$1.5"
      style={{ backdropFilter: 'blur(12px)', boxShadow: '0 24px 40px -28px rgba(15, 23, 32, 0.28)' }}
      zIndex={40}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.route
        const color = active ? '#005696' : '#6B7B8A'

        return (
          <YStack
            key={tab.route}
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$1"
            paddingVertical="$2"
            borderRadius="$full"
            backgroundColor={active ? '$accentSoft' : 'transparent'}
            cursor="pointer"
            onPress={() => {
              if (!active) router.push(tab.route as Parameters<typeof router.push>[0])
            }}
            hoverStyle={{ backgroundColor: active ? '$accentSoft' : '$backgroundHover' }}
            pressStyle={{ opacity: 0.72 }}
          >
            <Feather name={tab.icon} size={18} color={color} />
            <Text variant="caption" color={color} weight={active ? 'semibold' : 'regular'}>
              {tab.label}
            </Text>
          </YStack>
        )
      })}
    </HStack>
  )
}

export default BottomTabBar

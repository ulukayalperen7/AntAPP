import { usePathname, useRouter } from 'expo-router'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
  const insets = useSafeAreaInsets()

  const isTabRoute = pathname === '/' || TAB_ROUTES.has(pathname)
  if (!isTabRoute) return null

  return (
    <HStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="$backgroundStrong"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      justifyContent="space-around"
      alignItems="center"
      paddingBottom={insets.bottom || 12}
      paddingTop="$2"
      zIndex={20}
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
            paddingTop="$2"
            paddingBottom="$2"
            cursor="pointer"
            onPress={() => {
              if (!active) router.push(tab.route as Parameters<typeof router.push>[0])
            }}
            pressStyle={{ opacity: 0.7 }}
          >
            <Feather name={tab.icon} size={22} color={color} />
            <Text variant="caption" color={color} weight={active ? 'semibold' : 'regular'}>
              {tab.label}
            </Text>
          </YStack>
        )
      })}
    </HStack>
  )
}

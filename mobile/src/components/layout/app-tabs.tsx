import { usePathname, useRouter } from 'expo-router'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack, Text, styled } from 'tamagui'
import { Feather } from '@expo/vector-icons'

type TabItem = {
  route: string
  label: string
  icon: React.ComponentProps<typeof Feather>['name']
}

const TABS: TabItem[] = [
  { route: '/',        label: 'Home',    icon: 'home' },
  { route: '/explore', label: 'Explore', icon: 'compass' },
  { route: '/spots',   label: 'Spots',   icon: 'map-pin' },
  { route: '/create',  label: 'Create',  icon: 'plus-circle' },
  { route: '/profile', label: 'Profile', icon: 'user' },
]

const TAB_ROUTES = new Set(TABS.map((t) => t.route))

const TabBarContainer = styled(XStack, {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  justifyContent: 'space-around',
  alignItems: 'center',
})

const TabItemFrame = styled(YStack, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',
  paddingTop: '$2',
  pressStyle: { opacity: 0.6 },
  cursor: 'pointer',
})

export function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const isTabRoute = pathname === '/' || TAB_ROUTES.has(pathname)
  if (!isTabRoute) return null

  return (
    <TabBarContainer paddingBottom={insets.bottom || 12}>
      {TABS.map((tab) => {
        const active = pathname === tab.route
        const color = active ? '#FF8C00' : '#999'

        return (
          <TabItemFrame
            key={tab.route}
            onPress={() => {
              if (!active) router.push(tab.route as Parameters<typeof router.push>[0])
            }}
          >
            <Feather name={tab.icon} size={22} color={color} />
            <Text
              fontSize={10}
              fontWeight={active ? '600' : '400'}
              color={active ? '#FF8C00' : '$mutedForeground'}
            >
              {tab.label}
            </Text>
          </TabItemFrame>
        )
      })}
    </TabBarContainer>
  )
}

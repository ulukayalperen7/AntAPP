import React, { useState } from 'react'
import { YStack, XStack, Text, Avatar, StatBox, Button, RouteCard, FilterChip, Badge, ScrollView } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/features/auth/context'
import { Feather } from '@expo/vector-icons'

const ACHIEVEMENTS = [
  { icon: 'award' as const, name: 'Top Explorer', detail: 'Unlocked Dec 2023', color: '#F59E0B' },
  { icon: 'trending-up' as const, name: 'Mountain King', detail: 'Reached 5,000m total', color: '#6366F1' },
  { icon: 'zap' as const, name: 'Trail Blazer', detail: 'First to finish 5 routes', color: '#10B981' },
]

const MY_ROUTES: RouteCardData[] = [
  {
    id: '1',
    title: "Hadrian's Gate Walk",
    location: 'Antalya, Turkey',
    distance: '4.2 km',
    duration: '1h 20m',
    difficulty: 'moderate',
    isFavorited: true,
  },
  {
    id: '2',
    title: 'Old Town Walls',
    location: 'Kaleiçi, Turkey',
    distance: '2.5 km',
    duration: '45m',
    difficulty: 'easy',
  },
]

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<'created' | 'favorited'>('created')
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$5">
          {/* Profile Header */}
          <YStack alignItems="center" gap="$3">
            <Avatar size="xl" initials={user?.userName?.charAt(0)?.toUpperCase() ?? 'U'} />
            <YStack alignItems="center" gap="$1">
              <Text variant="heading2">{user?.userName ?? 'User'}</Text>
              <XStack alignItems="center" gap="$1.5">
                <Feather name="star" size={16} color="var(--color-primary, #005696)" />
                <Text variant="body" color="$primary">Adventurer</Text>
              </XStack>
            </YStack>
            <XStack gap="$2">
              <Button variant="solid" size="sm">Follow</Button>
              <Button variant="outline" size="sm">
                <Feather name="share-2" size={18} color="currentColor" />
              </Button>
            </XStack>
          </YStack>

          {/* Stats */}
          <XStack gap="$2" flexWrap="wrap">
            <StatBox value="1.2k" label="Followers" flex={1} />
            <StatBox value="482" label="Following" flex={1} />
          </XStack>
          <XStack gap="$2" flexWrap="wrap" marginTop={-12}>
            <StatBox value="5" label="Routes Created" flex={1} />
            <StatBox value="12" label="Completed" flex={1} />
          </XStack>

          {/* Achievements */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
            <Text variant="heading4">Achievements</Text>
            <YStack gap="$3">
              {ACHIEVEMENTS.map((a) => (
                <XStack key={a.name} gap="$3" alignItems="center">
                  <XStack
                    width={40}
                    height={40}
                    borderRadius="$full"
                    backgroundColor="$ant50"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Feather name={a.icon} size={20} color={a.color} />
                  </XStack>
                  <YStack flex={1}>
                    <Text variant="label" fontSize="$4">{a.name}</Text>
                    <Text variant="caption" muted>{a.detail}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* My Routes */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="heading3">My Routes</Text>
            </XStack>
            <XStack gap="$2">
              <FilterChip active={tab === 'created'} onPress={() => setTab('created')}>Created</FilterChip>
              <FilterChip active={tab === 'favorited'} onPress={() => setTab('favorited')}>Favorited</FilterChip>
            </XStack>
            <YStack gap="$4">
              {MY_ROUTES.map((route) => (
                <RouteCard key={route.id} data={route} />
              ))}
            </YStack>
          </YStack>

          <Button variant="outline" onPress={logout}>
            Logout
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

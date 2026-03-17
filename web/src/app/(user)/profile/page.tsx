'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Avatar, StatBox, Badge, RouteCard, FilterChip } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'

const PROFILE = {
  name: 'Alex Walker',
  title: 'Adventurer',
  followers: '1.2k',
  following: '482',
  routesCreated: 5,
  routesCompleted: 12,
}

const ACHIEVEMENTS = [
  { icon: '\u{1F3C6}', name: 'Top Explorer', detail: 'Unlocked Dec 2023' },
  { icon: '\u{26F0}', name: 'Mountain King', detail: 'Reached 5,000m total' },
  { icon: '\u{2728}', name: 'Trail Blazer', detail: 'First to finish 5 routes' },
]

const CREATED_ROUTES: RouteCardData[] = [
  {
    id: '1',
    title: "Hadrian's Gate",
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
    isFavorited: true,
  },
  {
    id: '3',
    title: 'Eagle Peak Trail',
    location: 'Taurus Mountains',
    distance: '12.0 km',
    duration: '4h 30m',
    difficulty: 'hard',
    isFavorited: false,
  },
]

const ACTIVITY_GRID = [
  [3, 2, 1, 3, 2, 1, 0],
  [2, 3, 3, 2, 1, 0, 3],
  [1, 2, 0, 3, 3, 2, 1],
  [3, 1, 2, 0, 1, 3, 2],
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getActivityColor(level: number) {
  if (level === 0) return '$muted'
  if (level === 1) return '$ant100'
  if (level === 2) return '$ant300'
  return '$ant500'
}

export default function ProfilePage() {
  const [tab, setTab] = useState<'created' | 'favorited'>('created')

  return (
    <YStack gap="$5" flex={1}>
      {/* Profile Header */}
      <XStack gap="$5" alignItems="center" flexWrap="wrap">
        <Avatar size="xl" initials="AW" />
        <YStack flex={1} gap="$1">
          <Text variant="heading2">{PROFILE.name}</Text>
          <XStack alignItems="center" gap="$1.5">
            <Text fontSize="$5" color="$primary">{'\u{2B50}'}</Text>
            <Text variant="body" color="$primary">{PROFILE.title}</Text>
          </XStack>
        </YStack>
        <XStack gap="$2">
          <Button variant="solid" size="md">Follow</Button>
          <Button variant="outline" size="md">{'\u{1F517}'}</Button>
        </XStack>
      </XStack>

      {/* Stats */}
      <XStack gap="$3" flexWrap="wrap">
        <StatBox value={PROFILE.followers} label="Followers" />
        <StatBox value={PROFILE.following} label="Following" />
        <StatBox value={PROFILE.routesCreated} label="Routes Created" />
        <StatBox value={PROFILE.routesCompleted} label="Routes Completed" />
      </XStack>

      {/* Two Column Layout */}
      <XStack gap="$5" flexWrap="wrap">
        {/* Left: Activity + Achievements */}
        <YStack flex={1} minWidth={320} gap="$5">
          {/* Activity Heatmap */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="heading4">Activity</Text>
              <Text variant="caption" muted>THIS MONTH</Text>
            </XStack>
            <XStack gap="$1" justifyContent="center" marginBottom="$1">
              {DAYS.map((d) => (
                <Text key={d} variant="caption" muted width={32} align="center" fontSize="$1">{d}</Text>
              ))}
            </XStack>
            <YStack gap="$1.5" alignItems="center">
              {ACTIVITY_GRID.map((week, wi) => (
                <XStack key={wi} gap="$1">
                  {week.map((level, di) => (
                    <YStack
                      key={di}
                      width={32}
                      height={32}
                      borderRadius="$2"
                      backgroundColor={getActivityColor(level)}
                    />
                  ))}
                </XStack>
              ))}
            </YStack>
            <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
              <Text variant="caption" muted>Longest Streak</Text>
              <Text variant="label" color="$primary">14 Days</Text>
            </XStack>
          </YStack>

          {/* Achievements */}
          <YStack backgroundColor="$backgroundStrong" borderRadius="$4" padding="$4" gap="$3">
            <Text variant="heading4">Achievements</Text>
            <YStack gap="$3">
              {ACHIEVEMENTS.map((a) => (
                <XStack key={a.name} gap="$3" alignItems="center">
                  <XStack
                    width={44}
                    height={44}
                    borderRadius="$full"
                    backgroundColor="$ant50"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="$6">{a.icon}</Text>
                  </XStack>
                  <YStack>
                    <Text variant="label">{a.name}</Text>
                    <Text variant="caption" muted>{a.detail}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
            <Text variant="body" color="$primary" cursor="pointer" fontSize="$3">
              View All Badges
            </Text>
          </YStack>
        </YStack>

        {/* Right: My Routes */}
        <YStack flex={2} minWidth={400} gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="heading3">My Routes</Text>
            <XStack gap="$2">
              <FilterChip active={tab === 'created'} onPress={() => setTab('created')}>Created</FilterChip>
              <FilterChip active={tab === 'favorited'} onPress={() => setTab('favorited')}>Favorited</FilterChip>
            </XStack>
          </XStack>

          <XStack flexWrap="wrap" gap="$4">
            {CREATED_ROUTES.map((route) => (
              <YStack key={route.id} flex={1} minWidth={260} maxWidth="50%">
                <RouteCard data={route} />
              </YStack>
            ))}
            {/* Create Route Card */}
            <YStack
              flex={1}
              minWidth={260}
              maxWidth="50%"
              borderRadius="$4"
              borderWidth={2}
              borderStyle="dashed"
              borderColor="$borderColor"
              alignItems="center"
              justifyContent="center"
              minHeight={280}
              cursor="pointer"
              hoverStyle={{ borderColor: '$primary' }}
              gap="$2"
            >
              <XStack
                width={48}
                height={48}
                borderRadius="$full"
                backgroundColor="$muted"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="$8" color="$mutedForeground">+</Text>
              </XStack>
              <Text variant="label">Create Route</Text>
              <Text variant="caption" muted>Share your latest adventure</Text>
            </YStack>
          </XStack>
        </YStack>
      </XStack>
    </YStack>
  )
}

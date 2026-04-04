import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Avatar, StatBox, Button, RouteCard, ScrollView } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/features/auth/context'
import { Feather } from '@expo/vector-icons'
import type { CurrentUser, RouteListItem } from '@/features/api/types'
import { getCurrentUser } from '@/features/account/api'
import { getRoutes } from '@/features/routes/api'
import { routeToCardData } from '@/features/routes/presenters'

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<CurrentUser | null>(null)
  const [routes, setRoutes] = useState<RouteListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    let mounted = true

    Promise.allSettled([
      getCurrentUser(),
      getRoutes({ authorId: user.id, pageSize: 20 }),
    ]).then((results) => {
      if (!mounted) return

      const [profileResult, routesResult] = results
      setProfile(profileResult.status === 'fulfilled' ? profileResult.value : null)
      setRoutes(routesResult.status === 'fulfilled' ? routesResult.value.data : [])
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [user?.id])

  const publicCount = useMemo(() => routes.filter((route) => route.isPublic).length, [routes])
  const privateCount = routes.length - publicCount

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$5">
          <YStack alignItems="center" gap="$3">
            <Avatar size="xl" initials={profile?.userName?.charAt(0)?.toUpperCase() ?? user?.userName?.charAt(0)?.toUpperCase() ?? 'U'} />
            <YStack alignItems="center" gap="$1">
              <Text variant="heading2">{profile?.userName ?? user?.userName ?? 'User'}</Text>
              <Text variant="body" muted>{profile?.email ?? user?.email}</Text>
            </YStack>
            {!profile?.isVerified ? (
              <XStack backgroundColor="$warning50" paddingHorizontal="$3" paddingVertical="$1.5" borderRadius="$full">
                <Text variant="caption" color="$warning500">Email not verified</Text>
              </XStack>
            ) : null}
          </YStack>

          <XStack gap="$2" flexWrap="wrap">
            <StatBox value={routes.length} label="Routes" flex={1} />
            <StatBox value={publicCount} label="Public" flex={1} />
            <StatBox value={privateCount} label="Private" flex={1} />
          </XStack>

          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="heading3">My Routes</Text>
              <Button variant="outline" size="sm" onPress={() => router.push('/create')}>
                Create
              </Button>
            </XStack>

            {routes.length > 0 ? (
              <YStack gap="$4">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    data={routeToCardData(route)}
                    onPress={() => router.push(`/routes/${route.id}`)}
                  />
                ))}
              </YStack>
            ) : !loading ? (
              <YStack alignItems="center" justifyContent="center" padding="$6" gap="$3" backgroundColor="$backgroundStrong" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
                <Feather name="map" size={32} color="var(--color-mutedForeground, #999)" />
                <Text variant="heading4" muted>No routes yet</Text>
                <Text variant="body" muted align="center">Create your first route to start building your profile.</Text>
              </YStack>
            ) : (
              <Text variant="body" muted>Loading your routes...</Text>
            )}
          </YStack>

          <Button variant="outline" onPress={logout}>
            Logout
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

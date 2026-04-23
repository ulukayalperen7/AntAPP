import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'expo-router'
import { Share } from 'react-native'
import { YStack, XStack, Text, Avatar, StatBox, Button, RouteCard, ScrollView, Badge } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/features/auth/context'
import { Feather } from '@expo/vector-icons'
import type { CurrentUser, RouteListItem } from '@/features/api/types'
import { getCurrentUser } from '@/features/account/api'
import { getRoutes, publishRoute, unpublishRoute } from '@/features/routes/api'
import { routeToCardData } from '@/features/routes/presenters'

function RouteActionCard({
  route,
  onPress,
}: {
  route: RouteListItem
  onPress: () => void
}) {
  const router = useRouter()
  const [isPublic, setIsPublic] = useState(route.isPublic)
  const [isToggling, startToggle] = useTransition()

  const handleTogglePublish = () => {
    startToggle(async () => {
      try {
        if (isPublic) {
          await unpublishRoute(route.id)
          setIsPublic(false)
        } else {
          await publishRoute(route.id)
          setIsPublic(true)
        }
      } catch {}
    })
  }

  return (
    <YStack position="relative">
      <RouteCard
        data={routeToCardData(route)}
        onPress={onPress}
      />
      {/* Overlay action bar — matches web exactly */}
      <XStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="rgba(0,0,0,0.65)"
        borderBottomLeftRadius={12}
        borderBottomRightRadius={12}
        paddingHorizontal="$3"
        paddingVertical="$2"
        gap="$2"
        justifyContent="flex-end"
        alignItems="center"
      >
        {/* Status indicator */}
        <XStack flex={1} alignItems="center" gap="$1.5">
          <Feather
            name={isPublic ? 'globe' : 'lock'}
            size={13}
            color={isPublic ? '#4ade80' : '#d1d5db'}
          />
          <Text
            variant="caption"
            color={isPublic ? '#4ade80' : '#d1d5db'}
            fontSize={11}
          >
            {isPublic ? 'Public' : 'Private'}
          </Text>
        </XStack>

        {/* Toggle publish */}
        <XStack
          cursor="pointer"
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
          backgroundColor="rgba(255,255,255,0.12)"
          pressStyle={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
          opacity={isToggling ? 0.5 : 1}
          onPress={handleTogglePublish}
        >
          <Text variant="caption" color="#FFFFFF" fontSize={11}>
            {isPublic ? 'Unpublish' : 'Publish'}
          </Text>
        </XStack>

        {/* Edit */}
        <XStack
          cursor="pointer"
          padding="$1.5"
          borderRadius="$2"
          backgroundColor="rgba(255,255,255,0.12)"
          pressStyle={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
          onPress={() => router.push(`/routes/${route.id}/edit`)}
        >
          <Feather name="edit-2" size={14} color="#FFFFFF" />
        </XStack>
      </XStack>
    </YStack>
  )
}

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

    return () => { mounted = false }
  }, [user?.id])

  const publicCount = useMemo(() => routes.filter((r) => r.isPublic).length, [routes])
  const privateCount = routes.length - publicCount
  const displayName = profile?.userName ?? user?.userName ?? 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleShare = () => {
    Share.share({
      title: displayName,
      message: `Check out ${displayName}'s profile on AntAPP`,
    }).catch(() => {})
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$5">
          {/* Top bar */}
          <XStack justifyContent="flex-end" gap="$2">
            <XStack cursor="pointer" onPress={handleShare} padding="$2" borderRadius="$full">
              <Feather name="share-2" size={20} color="currentColor" />
            </XStack>
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push('/settings')}
              icon={<Feather name="settings" size={14} />}
            >
              Edit Profile
            </Button>
          </XStack>

          {/* Avatar & info */}
          <YStack alignItems="center" gap="$3">
            <Avatar size="xl" initials={initials} src={profile?.profilePhotoUrl ?? undefined} />
            <YStack alignItems="center" gap="$1">
              <Text variant="heading2">{displayName}</Text>
              <Text variant="body" muted>{profile?.email ?? user?.email}</Text>
            </YStack>

            {!profile?.isVerified ? (
              <XStack backgroundColor="$warning50" paddingHorizontal="$3" paddingVertical="$1.5" borderRadius="$full">
                <Text variant="caption" color="$warning500">Email not verified</Text>
              </XStack>
            ) : null}

            {profile?.roles?.length ? (
              <XStack gap="$1.5" flexWrap="wrap" justifyContent="center">
                {profile.roles.map((role) => (
                  <Badge key={role} variant="info" size="sm">{role}</Badge>
                ))}
              </XStack>
            ) : null}
          </YStack>

          {/* Stats */}
          <XStack gap="$2" flexWrap="wrap">
            <StatBox value={routes.length} label="Routes" flex={1} />
            {publicCount > 0 ? <StatBox value={publicCount} label="Public" flex={1} /> : null}
            {privateCount > 0 ? <StatBox value={privateCount} label="Private" flex={1} /> : null}
          </XStack>

          {/* Routes */}
          <YStack gap="$3">
            <Text variant="heading3">My Routes</Text>

            {routes.length > 0 ? (
              <YStack gap="$4">
                {routes.map((route) => (
                  <RouteActionCard
                    key={route.id}
                    route={route}
                    onPress={() => router.push(`/routes/${route.id}`)}
                  />
                ))}

                {/* Create placeholder card */}
                <YStack
                  borderRadius="$4"
                  borderWidth={2}
                  borderStyle="dashed"
                  borderColor="$borderColor"
                  alignItems="center"
                  justifyContent="center"
                  height={100}
                  cursor="pointer"
                  gap="$2"
                  onPress={() => router.push('/create')}
                  pressStyle={{ borderColor: '$primary', backgroundColor: '$ant50' }}
                >
                  <Feather name="plus-circle" size={24} color="#005696" />
                  <Text variant="label" color="$primary">Create Route</Text>
                </YStack>
              </YStack>
            ) : !loading ? (
              <YStack
                alignItems="center"
                justifyContent="center"
                height={200}
                gap="$3"
                borderRadius="$4"
                borderWidth={2}
                borderStyle="dashed"
                borderColor="$borderColor"
                cursor="pointer"
                onPress={() => router.push('/create')}
                pressStyle={{ borderColor: '$primary', backgroundColor: '$ant50' }}
              >
                <Feather name="plus-circle" size={32} color="#005696" />
                <YStack alignItems="center" gap="$1">
                  <Text variant="label" color="$primary">Create Route</Text>
                  <Text variant="body" muted>Share your latest adventure</Text>
                </YStack>
              </YStack>
            ) : (
              <Text variant="body" muted>Loading your routes...</Text>
            )}
          </YStack>

          {/* Logout */}
          <Button variant="ghost" size="md" onPress={logout}>
            <Text variant="label" color="$error500">Logout</Text>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Avatar, RouteCard, StatBox } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { CurrentUser, RouteListItem } from '@/types/api'
import { deleteRoute, publishRoute, unpublishRoute } from '@/features/routes/actions'
import { Plus, Globe, Lock, Pencil, Trash2, GitFork } from 'lucide-react'

function routeToCardData(route: RouteListItem): RouteCardData {
  const source = route.originalAuthorName?.trim()

  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
    contentType: route.contentType,
    isOfficial: route.contentType === 'Official',
    tag: source ? `Copy from ${source}` : 'Original route',
  }
}

function RouteActionCard({
  route,
  onPress,
  onRemoved,
}: {
  route: RouteListItem
  onPress: () => void
  onRemoved: (routeId: string) => void
}) {
  const router = useRouter()
  const [isPublic, setIsPublic] = useState(route.isPublic)
  const [isToggling, startToggle] = useTransition()
  const [isRemoving, startRemove] = useTransition()
  const isForkedCopy = !!route.originalRouteId || !!route.originalAuthorName

  const handleTogglePublish = (e: React.MouseEvent) => {
    e.stopPropagation()
    startToggle(async () => {
      try {
        if (isPublic) {
          await unpublishRoute(route.id)
          setIsPublic(false)
        } else {
          await publishRoute(route.id)
          setIsPublic(true)
        }
      } catch { /* ignore */ }
    })
  }

  const handleRemoveCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isForkedCopy || isRemoving) return
    if (!window.confirm('Remove this forked copy from My Routes? The original route will stay available.')) return

    startRemove(async () => {
      try {
        await deleteRoute(route.id)
        onRemoved(route.id)
      } catch { /* ignore */ }
    })
  }

  return (
    <YStack flex={1} position="relative">
      <RouteCard
        data={routeToCardData(route)}
        onPress={onPress}
      />
      <XStack
        position="absolute"
        top="$2"
        left="$2"
        right="$2"
        gap="$1.5"
        justifyContent="flex-end"
        alignItems="center"
        flexWrap="wrap"
        pointerEvents="auto"
      >
        <XStack
          position="absolute"
          left="$0"
          top="$0"
          alignItems="center"
          gap="$1.5"
          backgroundColor="rgba(255,255,255,0.92)"
          borderRadius="$full"
          paddingHorizontal="$2"
          paddingVertical="$1"
        >
          {isPublic
            ? <Globe size={13} color="var(--color-success500)" />
            : <Lock size={13} color="var(--color-mutedForeground)" />
          }
          <Text variant="caption" color={isPublic ? '$success500' : '$mutedForeground'} fontSize="$2">
            {isPublic ? 'Public' : 'Private draft'}
          </Text>
          {isForkedCopy && (
            <Text variant="caption" muted fontSize="$2">
              Copy
            </Text>
          )}
        </XStack>

        <XStack gap="$1.5" alignItems="center">
          {isForkedCopy && (
            <XStack
              paddingHorizontal="$2"
              paddingVertical="$1.5"
              borderRadius="$full"
              backgroundColor="rgba(255,255,255,0.92)"
              alignItems="center"
              gap="$1"
            >
              <GitFork size={13} color="currentColor" />
              <Text variant="caption" fontSize="$2">Copy</Text>
            </XStack>
          )}
          <XStack
            cursor="pointer"
            paddingHorizontal="$2"
            paddingVertical="$1.5"
            borderRadius="$full"
            backgroundColor="rgba(255,255,255,0.92)"
            hoverStyle={{ backgroundColor: '$backgroundStrong' }}
            onPress={(e: any) => handleTogglePublish(e)}
            opacity={isToggling ? 0.5 : 1}
          >
            <Text variant="caption" fontSize="$2">
              {isPublic ? 'Unpublish' : 'Publish'}
            </Text>
          </XStack>

          <XStack
            cursor="pointer"
            padding="$1.5"
            borderRadius="$full"
            backgroundColor="rgba(255,255,255,0.92)"
            hoverStyle={{ backgroundColor: '$backgroundStrong' }}
            onPress={() => router.push(`/routes/${route.id}/edit`)}
          >
            <Pencil size={14} color="currentColor" />
          </XStack>

          {isForkedCopy && (
            <XStack
              cursor={isRemoving ? 'default' : 'pointer'}
              padding="$1.5"
              borderRadius="$full"
              backgroundColor="$error500"
              hoverStyle={{ opacity: 0.9 }}
              onPress={(e: any) => handleRemoveCopy(e)}
              opacity={isRemoving ? 0.5 : 1}
            >
              <Trash2 size={14} color="#FFFFFF" />
            </XStack>
          )}
        </XStack>
      </XStack>
    </YStack>
  )
}

export default function ProfileClient({
  user,
  routes,
}: {
  user: CurrentUser | null
  routes: RouteListItem[]
}) {
  const router = useRouter()
  const [routeItems, setRouteItems] = useState(routes)

  useEffect(() => {
    setRouteItems(routes)
  }, [routes])

  if (!user) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$8">
        <Text variant="heading3" muted>Could not load profile</Text>
        <Button variant="outline" size="md" onPress={() => router.push('/')}>Go to Home</Button>
      </YStack>
    )
  }

  const initials = user.userName?.slice(0, 2).toUpperCase() ?? 'U'
  const publicCount = routeItems.filter((r) => r.isPublic).length
  const privateCount = routeItems.length - publicCount

  return (
    <YStack gap="$5" flex={1}>
      <XStack gap="$5" alignItems="center" flexWrap="wrap">
        <Avatar size="xl" initials={initials} src={user.profilePhotoUrl ?? undefined} />
        <YStack flex={1} gap="$1">
          <Text variant="heading2">{user.userName}</Text>
          {user.email && (
            <Text variant="body" muted>{user.email}</Text>
          )}
          {!user.isVerified && (
            <XStack
              backgroundColor="$warning50"
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              borderRadius="$2"
              alignSelf="flex-start"
              marginTop="$1"
            >
              <Text variant="caption" color="$warning500">Email not verified</Text>
            </XStack>
          )}
        </YStack>
        <XStack gap="$2">
          <Button variant="outline" size="md" onPress={() => router.push('/settings')}>
            Edit Profile
          </Button>
        </XStack>
      </XStack>

      <XStack gap="$3" flexWrap="wrap">
        <StatBox value={routeItems.length} label="Routes" />
        {publicCount > 0 && <StatBox value={publicCount} label="Public" />}
        {privateCount > 0 && <StatBox value={privateCount} label="Private" />}
      </XStack>

      <YStack flex={2} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">My Routes</Text>
        </XStack>

        {routeItems.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {routeItems.map((route) => (
              <RouteActionCard
                key={route.id}
                route={route}
                onPress={() => router.push(`/routes/${route.id}`)}
                onRemoved={(routeId) => setRouteItems((current) => current.filter((item) => item.id !== routeId))}
              />
            ))}
            {/* Create placeholder */}
            <YStack
              borderRadius="$4"
              borderWidth={2}
              borderStyle="dashed"
              borderColor="$borderColor"
              alignItems="center"
              justifyContent="center"
              minHeight={280}
              cursor="pointer"
              gap="$3"
              onPress={() => router.push('/routes/create')}
              hoverStyle={{ borderColor: '$primary', backgroundColor: '$ant50' }}
              pressStyle={{ scale: 0.985 }}
            >
              <YStack
                backgroundColor="$muted"
                borderRadius="$round"
                padding="$3"
              >
                <Plus size={24} color="var(--color-primary)" />
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Text variant="label" color="$primary">Create Route</Text>
                <Text variant="caption" muted>Share your latest adventure</Text>
              </YStack>
            </YStack>
          </div>
        ) : (
          <YStack
            borderRadius="$4"
            borderWidth={2}
            borderStyle="dashed"
            borderColor="$borderColor"
            alignItems="center"
            justifyContent="center"
            minHeight={280}
            gap="$3"
            cursor="pointer"
            onPress={() => router.push('/routes/create')}
            hoverStyle={{ borderColor: '$primary', backgroundColor: '$ant50' }}
            pressStyle={{ scale: 0.985 }}
          >
            <YStack
              backgroundColor="$muted"
              borderRadius="$round"
              padding="$4"
            >
              <Plus size={32} color="var(--color-primary)" />
            </YStack>
            <YStack gap="$1" alignItems="center">
              <Text variant="label" color="$primary">Create Route</Text>
              <Text variant="body" muted>Share your latest adventure</Text>
            </YStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

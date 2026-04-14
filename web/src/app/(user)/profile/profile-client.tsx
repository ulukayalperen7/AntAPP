'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Avatar, RouteCard, StatBox } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { CurrentUser, RouteListItem } from '@/types/api'
import { publishRoute, unpublishRoute } from '@/features/routes/actions'
import { Plus, Share2, Globe, Lock, Pencil } from 'lucide-react'

function routeToCardData(route: RouteListItem): RouteCardData {
  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
    contentType: route.contentType,
    isOfficial: route.contentType === 'Official',
  }
}

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

  return (
    <YStack flex={1} position="relative">
      <RouteCard
        data={routeToCardData(route)}
        onPress={onPress}
      />
      {/* Overlay action bar */}
      <XStack
        position="absolute"
        bottom="$0"
        left="$0"
        right="$0"
        backgroundColor="rgba(0,0,0,0.65)"
        borderBottomLeftRadius="$4"
        borderBottomRightRadius="$4"
        paddingHorizontal="$3"
        paddingVertical="$2"
        gap="$2"
        justifyContent="flex-end"
        alignItems="center"
      >
        {/* Publish status badge */}
        <XStack
          flex={1}
          alignItems="center"
          gap="$1.5"
        >
          {isPublic
            ? <Globe size={13} color="#4ade80" />
            : <Lock size={13} color="#d1d5db" />
          }
          <Text variant="caption" color={isPublic ? '#4ade80' : '#d1d5db'} fontSize="$2">
            {isPublic ? 'Public' : 'Private'}
          </Text>
        </XStack>

        {/* Toggle publish */}
        <XStack
          cursor="pointer"
          padding="$1.5"
          borderRadius="$2"
          backgroundColor="rgba(255,255,255,0.1)"
          hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          onPress={(e: any) => handleTogglePublish(e)}
          opacity={isToggling ? 0.5 : 1}
        >
          <Text variant="caption" color="#FFFFFF" fontSize="$2">
            {isPublic ? 'Unpublish' : 'Publish'}
          </Text>
        </XStack>

        {/* Edit */}
        <XStack
          cursor="pointer"
          padding="$1.5"
          borderRadius="$2"
          backgroundColor="rgba(255,255,255,0.1)"
          hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          onPress={() => router.push(`/routes/${route.id}/edit`)}
        >
          <Pencil size={14} color="#FFFFFF" />
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

  if (!user) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$8">
        <Text variant="heading3" muted>Could not load profile</Text>
        <Button variant="outline" size="md" onPress={() => router.push('/')}>Go to Home</Button>
      </YStack>
    )
  }

  const initials = user.userName?.slice(0, 2).toUpperCase() ?? 'U'
  const publicCount = routes.filter((r) => r.isPublic).length
  const privateCount = routes.length - publicCount

  return (
    <YStack gap="$5" flex={1}>
      {/* Profile Header */}
      <XStack gap="$5" alignItems="center" flexWrap="wrap">
        <Avatar size="xl" initials={initials} />
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
          <Button variant="outline" size="md">
            <Share2 size={18} color="currentColor" />
          </Button>
        </XStack>
      </XStack>

      {/* Stats */}
      <XStack gap="$3" flexWrap="wrap">
        <StatBox value={routes.length} label="Routes" />
        {publicCount > 0 && <StatBox value={publicCount} label="Public" />}
        {privateCount > 0 && <StatBox value={privateCount} label="Private" />}
      </XStack>

      <YStack flex={2} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">My Routes</Text>
        </XStack>

        {routes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {routes.map((route) => (
              <RouteActionCard
                key={route.id}
                route={route}
                onPress={() => router.push(`/routes/${route.id}`)}
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

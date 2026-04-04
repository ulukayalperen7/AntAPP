'use client'

import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Avatar, RouteCard, StatBox } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { CurrentUser, RouteListItem } from '@/types/api'
import { Plus, Share2 } from 'lucide-react'

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
        <StatBox value={routes.length} label="Routes Created" />
      </XStack>

      {/* My Routes */}
      <YStack flex={2} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text variant="heading3">My Routes</Text>
          <Button
            variant="solid"
            size="sm"
            icon={<Plus size={16} color="#fff" />}
            onPress={() => router.push('/routes/create')}
          >
            Create Route
          </Button>
        </XStack>

        {routes.length > 0 ? (
          <XStack flexWrap="wrap" gap="$4">
            {routes.map((route) => (
              <YStack key={route.id} flex={1} minWidth={260} maxWidth="50%">
                <RouteCard
                  data={routeToCardData(route)}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
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
              onPress={() => router.push('/routes/create')}
            >
              <XStack
                width={48}
                height={48}
                borderRadius="$full"
                backgroundColor="$muted"
                alignItems="center"
                justifyContent="center"
              >
                <Plus size={24} color="var(--color-mutedForeground)" />
              </XStack>
              <Text variant="label">Create Route</Text>
              <Text variant="caption" muted>Share your latest adventure</Text>
            </YStack>
          </XStack>
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
            hoverStyle={{ borderColor: '$primary' }}
          >
            <XStack
              width={64}
              height={64}
              borderRadius="$full"
              backgroundColor="$muted"
              alignItems="center"
              justifyContent="center"
            >
              <Plus size={32} color="var(--color-mutedForeground)" />
            </XStack>
            <YStack gap="$1" alignItems="center">
              <Text variant="heading4">No routes yet</Text>
              <Text variant="body" muted>Create your first route to get started</Text>
            </YStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

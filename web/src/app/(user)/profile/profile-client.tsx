'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Avatar, Image, StatBox } from '@antapp/ui'
import type { CurrentUser, RouteListItem } from '@/types/api'
import { deleteRoute, publishRoute, unpublishRoute } from '@/features/routes/actions'
import { Plus, Globe, Lock, Pencil, Trash2 } from 'lucide-react'

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

  const handleTogglePublish = (e: { stopPropagation: () => void }) => {
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

  const handleRemoveCopy = (e: { stopPropagation: () => void }) => {
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
    <YStack
      flex={1}
      backgroundColor="$card"
      borderRadius="$4"
      overflow="hidden"
      cursor="pointer"
      onPress={onPress}
      pressStyle={{ scale: 0.98, opacity: 0.95 }}
      hoverStyle={{ opacity: 0.95 }}
    >
      <YStack height={180} backgroundColor="$muted" position="relative">
        {route.thumbnailUrl ? (
          <Image src={route.thumbnailUrl} width="100%" height="100%" objectFit="cover" />
        ) : null}

        <XStack
          position="absolute"
          top="$2"
          left="$2"
          backgroundColor="rgba(255,255,255,0.92)"
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$full"
          gap="$1"
          alignItems="center"
          pointerEvents="none"
        >
          {isPublic ? <Globe size={12} color="#16A34A" /> : <Lock size={12} color="#64748B" />}
          <Text variant="caption" fontSize="$2" color={isPublic ? '$success500' : '$mutedForeground'}>
            {isPublic ? 'Public' : 'Draft'}
          </Text>
        </XStack>

        <XStack position="absolute" top="$2" right="$2" gap="$1">
          <XStack
            cursor="pointer"
            width={30}
            height={30}
            borderRadius="$full"
            backgroundColor="rgba(255,255,255,0.92)"
            alignItems="center"
            justifyContent="center"
            hoverStyle={{ backgroundColor: '$backgroundStrong' }}
            onPress={(e: any) => handleTogglePublish(e)}
            opacity={isToggling ? 0.5 : 1}
          >
            {isPublic
              ? <Lock size={15} color="currentColor" />
              : <Globe size={15} color="currentColor" />
            }
          </XStack>
          <XStack
            cursor="pointer"
            width={30}
            height={30}
            borderRadius="$full"
            backgroundColor="rgba(255,255,255,0.92)"
            alignItems="center"
            justifyContent="center"
            hoverStyle={{ backgroundColor: '$backgroundStrong' }}
            onPress={(e: any) => {
              e.stopPropagation()
              router.push(`/routes/${route.id}/edit`)
            }}
          >
            <Pencil size={15} color="currentColor" />
          </XStack>
          {isForkedCopy && (
            <XStack
              cursor={isRemoving ? 'default' : 'pointer'}
              width={30}
              height={30}
              borderRadius="$full"
              backgroundColor="$error500"
              alignItems="center"
              justifyContent="center"
              hoverStyle={{ opacity: 0.9 }}
              onPress={(e: any) => handleRemoveCopy(e)}
              opacity={isRemoving ? 0.5 : 1}
            >
              <Trash2 size={15} color="#FFFFFF" />
            </XStack>
          )}
        </XStack>
      </YStack>

      <YStack padding="$3" gap="$1.5" flex={1}>
        <Text fontSize="$2" fontWeight="600" color="$primary" textTransform="uppercase">
          {route.originalAuthorName?.trim() ? `Copy from ${route.originalAuthorName}` : 'Original route'}
        </Text>
        <Text fontFamily="$heading" fontSize="$5" fontWeight="600" color="$color" numberOfLines={2}>
          {route.title}
        </Text>
        {route.description ? (
          <Text fontSize="$3" color="$mutedForeground" numberOfLines={2}>
            {route.description}
          </Text>
        ) : null}
      </YStack>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {routeItems.map((route) => (
              <YStack key={route.id} minWidth={0}>
                <RouteActionCard
                  route={route}
                  onPress={() => router.push(`/routes/${route.id}`)}
                  onRemoved={(routeId) => setRouteItems((current) => current.filter((item) => item.id !== routeId))}
                />
              </YStack>
            ))}
            <YStack minWidth={0}>
              <YStack
                borderRadius="$4"
                borderWidth={2}
                borderStyle="dashed"
                borderColor="$borderColor"
                alignItems="center"
                justifyContent="center"
                minHeight={280}
                cursor="pointer"
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
                onPress={() => router.push('/routes/create')}
                gap="$3"
              >
                <YStack
                  width={48}
                  height={48}
                  borderRadius="$3"
                  backgroundColor="$backgroundHover"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Plus size={24} color="gray" />
                </YStack>
                <YStack alignItems="center">
                  <Text variant="body" weight="medium">Create Route</Text>
                  <Text variant="caption" muted>Share your latest adventure</Text>
                </YStack>
              </YStack>
            </YStack>
          </div>
        ) : (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            padding="$8"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$3"
            cursor="pointer"
            onPress={() => router.push('/routes/create')}
          >
            <Plus size={32} color="var(--color-primary)" />
            <Text variant="heading3">No routes yet?</Text>
            <Text variant="body" muted>Create your first route and share your adventure with others.</Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

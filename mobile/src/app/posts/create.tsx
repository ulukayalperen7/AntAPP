import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Avatar, Badge, Button, Card, Image, Input, ScrollView, Text, XStack, YStack } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { getCurrentUser } from '@/features/account/api'
import { createPost } from '@/features/posts/api'
import { getRoutes } from '@/features/routes/api'
import type { RouteListItem } from '@/features/api/types'

function getInitials(name?: string | null) {
  const value = name?.trim()
  if (!value) return 'A'

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function RouteChoiceCard({
  route,
  selected,
  onPress,
}: {
  route: RouteListItem
  selected: boolean
  onPress: () => void
}) {
  return (
    <Card
      variant={selected ? 'elevated' : 'outline'}
      size="sm"
      backgroundColor="$backgroundStrong"
      borderColor={selected ? '$primary' : '$borderColor'}
      borderWidth={selected ? 2 : 1}
      pressable
      onPress={onPress}
      gap="$3"
    >
      <XStack gap="$3" alignItems="center">
        <YStack width={72} height={72} borderRadius="$3" overflow="hidden" backgroundColor="$muted">
          {route.thumbnailUrl ? (
            <Image src={route.thumbnailUrl} width="100%" height="100%" objectFit="cover" />
          ) : (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <Feather name="map" size={22} color="var(--color-mutedForeground, #999)" />
            </YStack>
          )}
        </YStack>
        <YStack flex={1} gap="$1.5">
          <XStack gap="$2" alignItems="center" flexWrap="wrap">
            <Badge variant={route.contentType === 'Official' ? 'info' : 'default'} size="sm">
              {route.contentType}
            </Badge>
            {selected ? <Badge variant="success" size="sm">Selected</Badge> : null}
          </XStack>
          <Text variant="label" numberOfLines={2}>{route.title}</Text>
          {route.description ? (
            <Text variant="caption" muted numberOfLines={2}>{route.description}</Text>
          ) : null}
        </YStack>
        <Feather name={selected ? 'check-circle' : 'circle'} size={20} color="var(--color-primary)" />
      </XStack>
    </Card>
  )
}

export default function CreatePostScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { routeId: requestedRouteId } = useLocalSearchParams<{ routeId?: string }>()
  const [isPending, startTransition] = useTransition()

  const [routes, setRoutes] = useState<RouteListItem[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([
      getRoutes({ visibility: 'public', sort: 'newest', pageSize: 200 }),
      getCurrentUser(),
    ]).then(([routesResult, userResult]) => {
      if (!mounted) return

      const nextRoutes = routesResult.status === 'fulfilled' ? routesResult.value.data : []
      const nextUserId = userResult.status === 'fulfilled' ? userResult.value.id : null
      const sortedRoutes = [...nextRoutes].sort((left, right) => {
        if (nextUserId) {
          const leftOwn = left.authorUserId === nextUserId ? 1 : 0
          const rightOwn = right.authorUserId === nextUserId ? 1 : 0
          if (leftOwn !== rightOwn) return rightOwn - leftOwn
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      })

      const preselectedId = requestedRouteId && sortedRoutes.some((route) => route.id === requestedRouteId)
        ? requestedRouteId
        : sortedRoutes[0]?.id ?? ''

      setRoutes(sortedRoutes)
      setSelectedRouteId(preselectedId)
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [requestedRouteId])

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  )

  const updateImage = (index: number, value: string) => {
    setImageUrls((current) => current.map((url, idx) => (idx === index ? value : url)))
  }

  const addImageField = () => {
    setImageUrls((current) => [...current, ''])
  }

  const removeImageField = (index: number) => {
    setImageUrls((current) => current.filter((_, idx) => idx !== index))
  }

  const handleSubmit = () => {
    setError(null)

    if (!selectedRouteId) {
      setError('Please choose a route.')
      return
    }

    const normalizedContent = content.trim()
    const normalizedImages = imageUrls.map((url) => url.trim()).filter(Boolean)
    if (!normalizedContent && normalizedImages.length === 0) {
      setError('Add post text or at least one image.')
      return
    }

    startTransition(async () => {
      try {
        await createPost({
          routeId: selectedRouteId,
          content: normalizedContent || undefined,
          imageUrls: normalizedImages,
        })
        router.replace('/')
      } catch (e) {
        setError((e as Error).message ?? 'Failed to create post.')
      }
    })
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={140} gap="$5">
          <XStack alignItems="center" gap="$3">
            <XStack padding="$2" borderRadius="$full" onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color="currentColor" />
            </XStack>
            <YStack flex={1} gap="$1">
              <Text variant="heading2">Create Post</Text>
              <Text variant="body" muted>Share a public route with a caption and optional image URLs.</Text>
            </YStack>
            <Avatar size="md" initials={getInitials(selectedRoute?.authorUserName)} />
          </XStack>

          <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" gap="$4">
            <YStack gap="$1.5">
              <Text variant="heading4">Choose route</Text>
              <Text variant="caption" muted>Your own public routes are shown first.</Text>
            </YStack>

            {loading ? (
              <Text variant="caption" muted>Loading routes...</Text>
            ) : routes.length === 0 ? (
              <YStack padding="$4" borderRadius="$3" backgroundColor="$muted" gap="$2" alignItems="center">
                <Feather name="map" size={24} color="var(--color-mutedForeground, #999)" />
                <Text variant="label">No public routes available</Text>
                <Text variant="caption" muted align="center">Create or publish a route before creating a post.</Text>
                <Button variant="outline" size="sm" onPress={() => router.push('/create')}>
                  Create route
                </Button>
              </YStack>
            ) : (
              <YStack gap="$3">
                {routes.map((route) => (
                  <RouteChoiceCard
                    key={route.id}
                    route={route}
                    selected={route.id === selectedRouteId}
                    onPress={() => setSelectedRouteId(route.id)}
                  />
                ))}
              </YStack>
            )}

            {requestedRouteId && !routes.some((route) => route.id === requestedRouteId) && !loading ? (
              <Text variant="caption" color="$warning500">Requested route is not in your public route list.</Text>
            ) : null}
          </Card>

          <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" gap="$4">
            <YStack gap="$1.5">
              <Text variant="heading4">Post text</Text>
              <Input
                value={content}
                onChangeText={setContent}
                variant="outline"
                placeholder="Write a short caption for this post..."
                multiline
                numberOfLines={4}
                height={112}
                textAlignVertical="top"
              />
            </YStack>
          </Card>

          <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" gap="$4">
            <XStack justifyContent="space-between" alignItems="center" gap="$3">
              <YStack flex={1} gap="$1">
                <Text variant="heading4">Images</Text>
                <Text variant="caption" muted>Add image URLs for the post gallery.</Text>
              </YStack>
              <Button variant="outline" size="sm" icon={<Feather name="plus" size={14} />} onPress={addImageField}>
                Add
              </Button>
            </XStack>

            <YStack gap="$3">
              {imageUrls.map((url, index) => (
                <XStack key={`post-image-${index}`} gap="$2" alignItems="center">
                  <YStack width={36} height={36} borderRadius="$2" backgroundColor="$muted" alignItems="center" justifyContent="center">
                    <Feather name="image" size={16} color="var(--color-mutedForeground, #999)" />
                  </YStack>
                  <Input
                    value={url}
                    onChangeText={(value) => updateImage(index, value)}
                    variant="outline"
                    placeholder="https://example.com/image.jpg"
                    flex={1}
                  />
                  {imageUrls.length > 1 ? (
                    <Button variant="ghost" size="sm" onPress={() => removeImageField(index)} icon={<Feather name="trash-2" size={14} color="var(--color-error500, #DC2626)" />} />
                  ) : null}
                </XStack>
              ))}
            </YStack>
          </Card>

          {error ? (
            <YStack backgroundColor="$error50" borderRadius="$3" padding="$3" borderWidth={1} borderColor="$error200">
              <Text variant="caption" color="$error500">{error}</Text>
            </YStack>
          ) : null}
        </YStack>
      </ScrollView>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal="$4"
        paddingTop="$3"
        paddingBottom={insets.bottom + 12}
        backgroundColor="$backgroundStrong"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <XStack gap="$2">
          <Button variant="outline" size="lg" flex={1} onPress={() => router.back()}>
            Cancel
          </Button>
          <Button
            variant="solid"
            size="lg"
            flex={1}
            loading={isPending}
            disabled={isPending || loading || routes.length === 0 || !selectedRouteId}
            onPress={handleSubmit}
            icon={<Feather name="send" size={16} color="#FFFFFF" />}
          >
            Publish
          </Button>
        </XStack>
      </YStack>
    </YStack>
  )
}

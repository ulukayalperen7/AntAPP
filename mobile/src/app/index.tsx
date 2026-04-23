import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Avatar, Badge, Button, Card, Image, ScrollView, Text, XStack, YStack } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@/features/auth/context'
import { getRoutes } from '@/features/routes/api'
import type { RouteListItem } from '@/features/api/types'
import { HomeScreenSkeleton } from '@/components/loading/page-skeletons'

const PAGE_COPY = {
  title: 'Explore Feed',
  subtitle: 'Public routes now behave like social posts. Fresh shares, official highlights, and community motion all meet here first.',
  composer: 'Share a new route, drop a scenic update, or post today’s route draft...',
  railTitle: 'Trending now',
  railSubtitle: 'Routes getting the strongest pull in the public flow.',
}

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Now'

  const diffMinutes = Math.round((Date.now() - timestamp) / (1000 * 60))
  if (diffMinutes <= 1) return 'Now'
  if (diffMinutes < 60) return `${diffMinutes}m`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`

  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(value))
}

function formatFullDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getPostTone(route: RouteListItem) {
  switch (route.contentType) {
    case 'Official':
      return { badge: 'Official', variant: 'info' as const, label: 'Editorial drop' }
    case 'Sponsored':
      return { badge: 'Sponsored', variant: 'warning' as const, label: 'Partner feature' }
    default:
      return { badge: 'Community', variant: 'default' as const, label: 'Community post' }
  }
}

function getAuthor(route: RouteListItem) {
  if (route.contentType === 'Official') {
    return {
      name: 'AntAPP Official',
      role: 'Curated route desk',
      initials: 'AO',
    }
  }

  return {
    name: 'Route Explorer',
    role: 'Community creator',
    initials: 'RE',
  }
}

function StoryCard({
  route,
  action = false,
  onPress,
}: {
  route?: RouteListItem
  action?: boolean
  onPress: () => void
}) {
  if (action) {
    return (
      <Card
        variant="outline"
        size="sm"
        backgroundColor="$backgroundStrong"
        overflow="hidden"
        width={124}
        minWidth={124}
        gap="$0"
        padding={0}
        pressable
        onPress={onPress}
      >
        <YStack height={110} backgroundColor="$muted" />
        <YStack padding="$3" gap="$2" alignItems="center" justifyContent="center">
          <XStack
            width={42}
            height={42}
            borderRadius="$full"
            backgroundColor="$primary"
            alignItems="center"
            justifyContent="center"
            marginTop={-24}
            borderWidth={4}
            borderColor="$backgroundStrong"
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
          </XStack>
          <Text variant="label" align="center">Create Story</Text>
        </YStack>
      </Card>
    )
  }

  if (!route) return null

  const tone = getPostTone(route)

  return (
    <Card
      variant="outline"
      size="sm"
      backgroundColor="$backgroundStrong"
      overflow="hidden"
      width={124}
      minWidth={124}
      gap="$0"
      padding={0}
      pressable
      onPress={onPress}
    >
      <YStack position="relative" height={184} backgroundColor="$muted">
        {route.thumbnailUrl ? (
          <Image src={route.thumbnailUrl} width="100%" height="100%" objectFit="cover" />
        ) : null}
        <YStack position="absolute" top="$3" left="$3">
          <Avatar size="md" initials={getAuthor(route).initials} />
        </YStack>
        <YStack position="absolute" inset={0} backgroundColor="rgba(15,23,42,0.2)" />
        <YStack position="absolute" bottom="$3" left="$3" right="$3" gap="$1.5">
          <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
          <Text variant="label" color="#FFFFFF" numberOfLines={2}>
            {route.title}
          </Text>
        </YStack>
      </YStack>
    </Card>
  )
}

function FeedPostCard({
  route,
  onPress,
}: {
  route: RouteListItem
  onPress: () => void
}) {
  const tone = getPostTone(route)
  const author = getAuthor(route)

  return (
    <Card
      variant="outline"
      size="sm"
      backgroundColor="$backgroundStrong"
      gap="$4"
      pressable
      onPress={onPress}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
        <XStack gap="$3" flex={1}>
          <Avatar size="lg" initials={author.initials} />
          <YStack gap="$1.5" flex={1}>
            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Text variant="label">{author.name}</Text>
              <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
            </XStack>
            <Text variant="caption" muted>{author.role}</Text>
            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Text variant="caption" muted>{formatRelativeDate(route.createdAt)}</Text>
              <Text variant="caption" muted>•</Text>
              <Text variant="caption" muted>{tone.label}</Text>
            </XStack>
          </YStack>
        </XStack>

        <XStack padding="$1">
          <Feather name="more-horizontal" size={18} color="currentColor" />
        </XStack>
      </XStack>

      <YStack gap="$2.5">
        <Text variant="heading3">{route.title}</Text>
        <Text variant="body">
          {route.description?.trim() || 'A newly shared route just dropped into the public feed. Open the post to inspect the route map, stops, and full detail.'}
        </Text>
      </YStack>

      <YStack
        borderRadius="$4"
        overflow="hidden"
        backgroundColor="$muted"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack minHeight={260} backgroundColor="$muted">
          {route.thumbnailUrl ? (
            <Image src={route.thumbnailUrl} width="100%" height="100%" objectFit="cover" />
          ) : null}
        </YStack>

        <YStack padding="$4" gap="$3" backgroundColor="$background">
          <XStack gap="$2" flexWrap="wrap">
            <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
            <Badge variant="success" size="sm">{route.isPublic ? 'Public' : 'Draft'}</Badge>
          </XStack>

          <YStack gap="$2">
            <Text variant="label" color="$primary">Route Snapshot</Text>
            <Text variant="body" muted>
              Published {formatFullDate(route.createdAt)}. This card behaves like a post while still opening the same route detail flow.
            </Text>
          </YStack>

          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="caption" muted>Average rating</Text>
            <XStack alignItems="center" gap="$1">
              <Feather name="star" size={14} color="#F59E0B" />
              <Text variant="caption" weight="semibold">
                {route.averageRating > 0 ? route.averageRating.toFixed(1) : 'New'}
              </Text>
            </XStack>
          </XStack>

          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="caption" muted>Lane</Text>
            <Text variant="caption" weight="semibold">{route.contentType}</Text>
          </XStack>

          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="caption" muted>Post age</Text>
            <Text variant="caption" weight="semibold">{formatRelativeDate(route.createdAt)}</Text>
          </XStack>
        </YStack>
      </YStack>

      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <XStack gap="$3" alignItems="center">
          <XStack alignItems="center" gap="$1.5">
            <Feather name="thumbs-up" size={14} color="currentColor" />
            <Text variant="caption" muted>{12 + Math.round(route.averageRating * 3)} reacts</Text>
          </XStack>
          <XStack alignItems="center" gap="$1.5">
            <Feather name="message-circle" size={14} color="currentColor" />
            <Text variant="caption" muted>{4 + (route.title.length % 9)} comments</Text>
          </XStack>
        </XStack>
        <XStack alignItems="center" gap="$1.5">
          <Feather name="send" size={14} color="currentColor" />
          <Text variant="caption" muted>{1 + (route.title.length % 4)} shares</Text>
        </XStack>
      </XStack>

      <XStack
        borderTopWidth={1}
        borderTopColor="$borderColor"
        paddingTop="$3"
        justifyContent="space-between"
        gap="$2"
      >
        <Button variant="ghost" size="sm" icon={<Feather name="thumbs-up" size={16} color="currentColor" />}>Like</Button>
        <Button variant="ghost" size="sm" icon={<Feather name="message-circle" size={16} color="currentColor" />}>Comment</Button>
        <Button variant="ghost" size="sm" icon={<Feather name="share-2" size={16} color="currentColor" />}>Share</Button>
      </XStack>
    </Card>
  )
}

function RailCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" gap="$3">
      <YStack gap="$1">
        <Text variant="heading4">{title}</Text>
        <Text variant="body" muted>{subtitle}</Text>
      </YStack>
      {children}
    </Card>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [timelineRoutes, setTimelineRoutes] = useState<RouteListItem[]>([])
  const [spotlightRoutes, setSpotlightRoutes] = useState<RouteListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([
      getRoutes({ sort: 'newest', pageSize: 10 }),
      getRoutes({ sort: 'rating', type: 'official', pageSize: 5 }),
    ]).then((results) => {
      if (!mounted) return

      const [timelineResult, spotlightResult] = results
      setTimelineRoutes(timelineResult.status === 'fulfilled' ? timelineResult.value.data : [])
      setSpotlightRoutes(spotlightResult.status === 'fulfilled' ? spotlightResult.value.data : [])
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <HomeScreenSkeleton topInset={insets.top} />
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={100} gap="$4">
          <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" gap="$4">
            <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
              <YStack gap="$1">
                <Text variant="heading2">{PAGE_COPY.title}</Text>
                <Text variant="body" muted>
                  {PAGE_COPY.subtitle}
                </Text>
              </YStack>
              <Avatar size="md" initials={user?.userName?.charAt(0)?.toUpperCase() ?? 'A'} />
            </XStack>

            <XStack gap="$2" flexWrap="wrap">
              <Button variant="solid" size="sm">Timeline</Button>
              <Button variant="outline" size="sm" onPress={() => router.push('/explore?type=official')}>Official</Button>
              <Button variant="outline" size="sm" onPress={() => router.push('/explore?type=community')}>Community</Button>
            </XStack>
          </Card>

          <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" gap="$4">
            <XStack gap="$3" alignItems="center">
              <Avatar size="lg" initials="AE" />
              <XStack
                flex={1}
                minHeight={48}
                alignItems="center"
                paddingHorizontal="$4"
                borderRadius="$full"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text variant="body" muted>{PAGE_COPY.composer}</Text>
              </XStack>
            </XStack>

            <XStack gap="$2" flexWrap="wrap">
              <Button variant="ghost" size="sm" icon={<Feather name="video" size={16} color="#E11D48" />}>Live</Button>
              <Button variant="ghost" size="sm" icon={<Feather name="image" size={16} color="#16A34A" />}>Photo</Button>
              <Button variant="ghost" size="sm" icon={<Feather name="map-pin" size={16} color="#0EA5E9" />}>Check in</Button>
            </XStack>
          </Card>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$3" paddingBottom="$1">
              <StoryCard action onPress={() => router.push('/create')} />
              {spotlightRoutes.slice(0, 5).map((route) => (
                <StoryCard
                  key={route.id}
                  route={route}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
              ))}
            </XStack>
          </ScrollView>

          <YStack gap="$4">
            {timelineRoutes.length > 0 ? (
              timelineRoutes.map((route) => (
                <FeedPostCard
                  key={route.id}
                  route={route}
                  onPress={() => router.push(`/routes/${route.id}`)}
                />
              ))
            ) : (
              <Card variant="outline" size="lg" backgroundColor="$backgroundStrong" alignItems="center" gap="$3">
                <Text variant="heading4">No posts in feed yet</Text>
                <Text variant="body" muted align="center">
                  Once routes are shared publicly, they will land here as social-style posts.
                </Text>
              </Card>
            )}
          </YStack>

          <RailCard
            title={PAGE_COPY.railTitle}
            subtitle={PAGE_COPY.railSubtitle}
          >
            <YStack gap="$3">
              {spotlightRoutes.slice(0, 4).map((route) => (
                <XStack
                  key={route.id}
                  gap="$3"
                  alignItems="center"
                  onPress={() => router.push(`/routes/${route.id}`)}
                >
                  <YStack width={84} height={84} borderRadius="$3" overflow="hidden" backgroundColor="$muted">
                    {route.thumbnailUrl ? (
                      <Image src={route.thumbnailUrl} width="100%" height="100%" objectFit="cover" />
                    ) : null}
                  </YStack>
                  <YStack flex={1} gap="$1.5">
                    <Badge variant={getPostTone(route).variant} size="sm">{route.contentType}</Badge>
                    <Text variant="label" numberOfLines={2}>{route.title}</Text>
                    <XStack gap="$2" alignItems="center">
                      <Feather name="clock" size={12} color="currentColor" />
                      <Text variant="caption" muted>{formatRelativeDate(route.createdAt)}</Text>
                    </XStack>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </RailCard>

          <RailCard
            title="Sponsored"
            subtitle="Native placements inside the route feed"
          >
            <YStack gap="$3">
              <YStack
                borderRadius="$4"
                overflow="hidden"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <YStack height={148} backgroundColor="$muted">
                  {spotlightRoutes[0]?.thumbnailUrl ? (
                    <Image src={spotlightRoutes[0].thumbnailUrl} width="100%" height="100%" objectFit="cover" />
                  ) : null}
                </YStack>
                <YStack padding="$3" gap="$1.5">
                  <Text variant="label">Featured stays near popular routes</Text>
                  <Text variant="caption" muted>Blend route discovery with local stays, tours, or partner placements.</Text>
                </YStack>
              </YStack>
            </YStack>
          </RailCard>

          <RailCard
            title="Today in feed"
            subtitle="A compact status rail like a social network dashboard"
          >
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="caption" muted>New public posts</Text>
                <Text variant="label">{timelineRoutes.length}</Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="caption" muted>Official cards</Text>
                <Text variant="label">{timelineRoutes.filter((route) => route.contentType === 'Official').length}</Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="caption" muted>Community cards</Text>
                <Text variant="label">{timelineRoutes.filter((route) => route.contentType === 'Community').length}</Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="caption" muted>Alerts</Text>
                <XStack gap="$1.5" alignItems="center">
                  <Feather name="bell" size={14} color="currentColor" />
                  <Text variant="label">{Math.max(1, spotlightRoutes.length)}</Text>
                </XStack>
              </XStack>
            </YStack>
          </RailCard>

          <RailCard
            title="Quick actions"
            subtitle="Keep route creation close to the feed"
          >
            <YStack gap="$2.5">
              <Button
                variant="solid"
                size="sm"
                icon={<Feather name="plus" size={14} color="#FFFFFF" />}
                onPress={() => router.push('/create')}
              >
                Create route post
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Feather name="grid" size={14} color="currentColor" />}
                onPress={() => router.push('/profile')}
              >
                Manage my routes
              </Button>
            </YStack>
          </RailCard>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

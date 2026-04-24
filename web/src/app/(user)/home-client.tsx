'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Button, Card, Image, Text, XStack, YStack } from '@antapp/ui'
import type { RouteListItem } from '@/types/api'
import { Bell, Camera, CircleDot, Clock3, Compass, Ellipsis, Image as ImageIcon, MapPinned, MessageCircle, Plus, Send, Share2, Sparkles, Star, ThumbsUp } from 'lucide-react'

type FeedMode = 'timeline' | 'official' | 'community'

type HomeClientProps = {
  mode: FeedMode
  timelineRoutes: RouteListItem[]
  spotlightRoutes: RouteListItem[]
  currentUserName?: string | null
  referenceNowIso: string
}

const PAGE_COPY: Record<FeedMode, {
  title: string
  subtitle: string
  composer: string
  railTitle: string
  railSubtitle: string
}> = {
  timeline: {
    title: 'Explore Feed',
    subtitle: 'Public routes now behave like social posts. Fresh shares, official highlights, and community motion all meet here first.',
    composer: 'Share a new route, drop a scenic update, or post today’s route draft...',
    railTitle: 'Trending now',
    railSubtitle: 'Routes getting the strongest pull in the public flow.',
  },
  official: {
    title: 'Official Feed',
    subtitle: 'A cleaner editorial stream for curated and promoted route drops.',
    composer: 'Queue a featured route or spotlight an official collection...',
    railTitle: 'Editorial watchlist',
    railSubtitle: 'Fresh official cards the product can push harder.',
  },
  community: {
    title: 'Community Feed',
    subtitle: 'A faster social lane for user-created route posts, experiments, and daily shares.',
    composer: 'What route did the community just post today?',
    railTitle: 'Community momentum',
    railSubtitle: 'Recent public posts climbing fastest in the feed.',
  },
}

function parseApiDate(value: string) {
  const hasTimezone = /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value)
  const normalized = hasTimezone ? value : `${value}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatRelativeDate(value: string, referenceNowMs: number) {
  const parsed = parseApiDate(value)
  if (!parsed) return 'Now'
  const timestamp = parsed.getTime()

  const diffMinutes = Math.round((referenceNowMs - timestamp) / (1000 * 60))
  if (diffMinutes <= 1) return 'Now'
  if (diffMinutes < 60) return `${diffMinutes}m`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`

  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(parseApiDate(value) ?? new Date(0))
}

function formatFullDate(value: string) {
  const date = parseApiDate(value)
  if (!date) return 'Recently'

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
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

  const displayName = route.authorUserName?.trim() || 'Route Explorer'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('')
    || 'RE'

  return {
    name: displayName,
    role: 'Community creator',
    initials,
  }
}

function getInitials(name?: string | null) {
  const value = name?.trim()
  if (!value) return 'AN'

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('')
}

function StoryCard({
  route,
  action = false,
}: {
  route?: RouteListItem
  action?: boolean
}) {
  if (action) {
    return (
      <Card
        variant="outline"
        size="sm"
        backgroundColor="$backgroundStrong"
        overflow="hidden"
        width={140}
        minWidth={140}
        gap="$0"
        padding={0}
      >
        <YStack height={120} backgroundColor="$muted" />
        <YStack padding="$3" gap="$2" alignItems="center" justifyContent="center">
          <XStack
            width={44}
            height={44}
            borderRadius="$full"
            backgroundColor="$primary"
            alignItems="center"
            justifyContent="center"
            marginTop={-26}
            borderWidth={4}
            borderColor="$backgroundStrong"
          >
            <Plus size={18} color="#FFFFFF" />
          </XStack>
          <Text variant="label" align="center">Create Story</Text>
        </YStack>
      </Card>
    )
  }

  if (!route) return null

  const tone = getPostTone(route)
  const storyImage = route.postImageUrls?.[0] || route.thumbnailUrl

  return (
    <Link href={`/routes/${route.id}`} style={{ textDecoration: 'none' }}>
      <Card
        variant="outline"
        size="sm"
        backgroundColor="$backgroundStrong"
        overflow="hidden"
        width={140}
        minWidth={140}
        gap="$0"
        padding={0}
        pressable
      >
        <YStack position="relative" height={190} backgroundColor="$muted">
          {storyImage ? (
            <Image src={storyImage} width="100%" height="100%" objectFit="cover" />
          ) : null}
          <YStack position="absolute" inset={0} backgroundColor="rgba(15,23,42,0.22)" />
          <XStack position="absolute" top="$3" left="$3">
            <Avatar size="md" initials={getAuthor(route).initials} />
          </XStack>
          <YStack position="absolute" bottom="$3" left="$3" right="$3" gap="$1.5">
            <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
            <Text variant="label" color="#FFFFFF" numberOfLines={2}>
              {route.title}
            </Text>
          </YStack>
        </YStack>
      </Card>
    </Link>
  )
}

function FeedPostCard({
  route,
  referenceNowMs,
}: {
  route: RouteListItem
  referenceNowMs: number
}) {
  const router = useRouter()
  const tone = getPostTone(route)
  const author = getAuthor(route)
  const media = route.postImageUrls?.length ? route.postImageUrls : (route.thumbnailUrl ? [route.thumbnailUrl] : [])
  const coverImage = media[0] ?? null

  return (
    <Card
      variant="outline"
      size="sm"
      backgroundColor="$backgroundStrong"
      gap="$4"
      pressable
      onPress={() => router.push(`/routes/${route.id}`)}
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
              <Text variant="caption" muted>{formatRelativeDate(route.createdAt, referenceNowMs)}</Text>
              <CircleDot size={10} color="var(--color-mutedForeground)" />
              <Text variant="caption" muted>{tone.label}</Text>
            </XStack>
          </YStack>
        </XStack>

        <XStack gap="$2" alignItems="center">
          <Ellipsis size={18} color="var(--color-mutedForeground)" />
        </XStack>
      </XStack>

      <YStack gap="$2.5">
        <Text variant="heading3">{route.title}</Text>
        <Text variant="body" color="$color">
          {route.postContent?.trim() || route.description?.trim() || 'A newly shared route just dropped into the public feed. Open the card to inspect the route map, stops, and full detail.'}
        </Text>
      </YStack>

      <YStack
        borderRadius="$4"
        overflow="hidden"
        backgroundColor="$muted"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <XStack
          flexDirection={coverImage ? 'row' : 'column'}
          $md={{ flexDirection: 'column' }}
        >
          <YStack
            flex={1.1}
            minHeight={340}
            backgroundColor="$muted"
            $md={{ minHeight: 240 }}
          >
            {coverImage ? (
              <Image src={coverImage} width="100%" height="100%" objectFit="cover" />
            ) : null}
          </YStack>

          <YStack
            flex={0.9}
            padding="$4"
            gap="$3"
            backgroundColor="$background"
            borderLeftWidth={1}
            borderLeftColor="$borderColor"
            $md={{ borderLeftWidth: 0, borderTopWidth: 1, borderTopColor: '$borderColor' }}
          >
            <XStack gap="$2" flexWrap="wrap">
              <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
              <Badge variant="success" size="sm">{route.isPublic ? 'Public' : 'Draft'}</Badge>
            </XStack>

            <YStack gap="$2">
              <Text variant="label" color="$primary">Route Snapshot</Text>
              <Text variant="body" muted>
                Published {formatFullDate(route.createdAt)}. This card is rendered as a social post but still points into the same route detail experience.
              </Text>
            </YStack>

            {media.length > 1 ? (
              <YStack gap="$2">
                <Text variant="caption" muted>Post images ({media.length})</Text>
                <XStack gap="$2">
                  {media.slice(1, 4).map((url, index) => (
                    <YStack
                      key={`${route.postId ?? route.id}-${index}`}
                      width={60}
                      height={44}
                      borderRadius="$2"
                      overflow="hidden"
                      backgroundColor="$muted"
                    >
                      <Image src={url} width="100%" height="100%" objectFit="cover" />
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            ) : null}

            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="caption" muted>Average rating</Text>
                <XStack alignItems="center" gap="$1">
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
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
                <Text variant="caption" weight="semibold">{formatRelativeDate(route.createdAt, referenceNowMs)}</Text>
              </XStack>
            </YStack>

            <Button variant="outline" size="sm" icon={<Compass size={14} color="currentColor" />}>
              Open route
            </Button>
          </YStack>
        </XStack>
      </YStack>

      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <XStack gap="$3" alignItems="center">
          <XStack alignItems="center" gap="$1.5">
            <ThumbsUp size={14} color="var(--color-primary)" />
            <Text variant="caption" muted>0 reacts</Text>
          </XStack>
          <XStack alignItems="center" gap="$1.5">
            <MessageCircle size={14} color="var(--color-mutedForeground)" />
            <Text variant="caption" muted>0 comments</Text>
          </XStack>
        </XStack>
        <XStack alignItems="center" gap="$1.5">
          <Send size={14} color="var(--color-mutedForeground)" />
          <Text variant="caption" muted>0 shares</Text>
        </XStack>
      </XStack>

      <XStack
        borderTopWidth={1}
        borderTopColor="$borderColor"
        paddingTop="$3"
        justifyContent="space-between"
        gap="$2"
        flexWrap="wrap"
      >
        <Button variant="ghost" size="sm" disabled icon={<ThumbsUp size={16} color="currentColor" />}>Like</Button>
        <Button variant="ghost" size="sm" disabled icon={<MessageCircle size={16} color="currentColor" />}>Comment</Button>
        <Button variant="ghost" size="sm" disabled icon={<Share2 size={16} color="currentColor" />}>Share</Button>
      </XStack>
    </Card>
  )
}

function RightRailCard({
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

export default function HomeClient({
  mode,
  timelineRoutes,
  spotlightRoutes,
  currentUserName,
  referenceNowIso,
}: HomeClientProps) {
  const copy = PAGE_COPY[mode]
  const composerInitials = getInitials(currentUserName)
  const referenceNowMs = parseApiDate(referenceNowIso)?.getTime() ?? 0

  return (
    <XStack gap="$5" alignItems="flex-start" $md={{ flexDirection: 'column' }}>
      <YStack flex={1} minWidth={0} maxWidth={860} width="100%" gap="$4">
        <Card
          variant="outline"
          size="sm"
          backgroundColor="$backgroundStrong"
          gap="$4"
          borderRadius="$5"
        >
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$4" flexWrap="wrap">
            <YStack gap="$1.5" maxWidth={560}>
              <Text variant="heading2">{copy.title}</Text>
              <Text variant="body" muted>{copy.subtitle}</Text>
            </YStack>
            <XStack gap="$2" flexWrap="wrap">
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant={mode === 'timeline' ? 'solid' : 'outline'} size="sm">Timeline</Button>
              </Link>
              <Link href="/official" style={{ textDecoration: 'none' }}>
                <Button variant={mode === 'official' ? 'solid' : 'outline'} size="sm">Official</Button>
              </Link>
              <Link href="/community" style={{ textDecoration: 'none' }}>
                <Button variant={mode === 'community' ? 'solid' : 'outline'} size="sm">Community</Button>
              </Link>
            </XStack>
          </XStack>
        </Card>

        <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" gap="$4">
          <XStack gap="$3" alignItems="center">
            <Avatar size="lg" initials={composerInitials} />
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
              <Text variant="body" muted>{copy.composer}</Text>
            </XStack>
          </XStack>

          <XStack
            borderTopWidth={1}
            borderTopColor="$borderColor"
            paddingTop="$3"
            gap="$2"
            flexWrap="wrap"
          >
            <Button variant="ghost" size="sm" icon={<Camera size={16} color="#E11D48" />}>Live</Button>
            <Button variant="ghost" size="sm" icon={<ImageIcon size={16} color="#16A34A" />}>Photo</Button>
            <Button variant="ghost" size="sm" icon={<MapPinned size={16} color="#0EA5E9" />}>Check in</Button>
          </XStack>
        </Card>

        <XStack
          gap="$3"
          overflow="scroll"
          paddingBottom="$1"
          style={{ overflowY: 'hidden', scrollbarWidth: 'none' }}
        >
          <StoryCard action />
          {spotlightRoutes.slice(0, 5).map((route) => (
            <StoryCard key={`${route.postId ?? route.id}-${route.createdAt}`} route={route} />
          ))}
        </XStack>

        <YStack gap="$4">
          {timelineRoutes.length > 0 ? (
            timelineRoutes.map((route) => (
              <FeedPostCard key={`${route.postId ?? route.id}-${route.createdAt}`} route={route} referenceNowMs={referenceNowMs} />
            ))
          ) : (
            <Card variant="outline" size="lg" backgroundColor="$backgroundStrong" alignItems="center" gap="$3">
              <Text variant="heading4">No posts in this lane yet</Text>
              <Text variant="body" muted align="center" maxWidth={520}>
                Once routes are shared publicly, they will land here as social-style posts.
              </Text>
            </Card>
          )}
        </YStack>
      </YStack>

      <YStack
        width={320}
        minWidth={320}
        gap="$4"
        $md={{ width: '100%', minWidth: 0 }}
        style={{ position: 'sticky', top: '88px' }}
      >
        <RightRailCard title={copy.railTitle} subtitle={copy.railSubtitle}>
          <YStack gap="$3">
            {spotlightRoutes.slice(0, 4).map((route) => (
              <Link key={route.id} href={`/routes/${route.id}`} style={{ textDecoration: 'none' }}>
                <XStack gap="$3" alignItems="center">
                    <YStack width={88} height={88} borderRadius="$3" overflow="hidden" backgroundColor="$muted">
                    {(route.postImageUrls?.[0] || route.thumbnailUrl) ? (
                      <Image src={route.postImageUrls?.[0] || route.thumbnailUrl || ''} width="100%" height="100%" objectFit="cover" />
                    ) : null}
                  </YStack>
                  <YStack flex={1} gap="$1.5">
                    <Badge variant={getPostTone(route).variant} size="sm">{route.contentType}</Badge>
                    <Text variant="label" numberOfLines={2}>{route.title}</Text>
                    <XStack gap="$2" alignItems="center">
                      <Clock3 size={12} color="var(--color-mutedForeground)" />
                      <Text variant="caption" muted>{formatRelativeDate(route.createdAt, referenceNowMs)}</Text>
                    </XStack>
                  </YStack>
                </XStack>
              </Link>
            ))}
          </YStack>
        </RightRailCard>

        <RightRailCard title="Sponsored" subtitle="Native placements inside the route feed">
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
        </RightRailCard>

        <RightRailCard title="Today in feed" subtitle="A compact status rail like a social network dashboard">
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
                <Bell size={14} color="var(--color-primary)" />
                <Text variant="label">{Math.max(1, spotlightRoutes.length)}</Text>
              </XStack>
            </XStack>
          </YStack>
        </RightRailCard>

        <RightRailCard title="Quick actions" subtitle="Keep route creation close to the feed">
          <YStack gap="$2.5">
            <Link href="/posts/create" style={{ textDecoration: 'none' }}>
              <Button variant="solid" size="sm" icon={<Plus size={14} color="#FFFFFF" />}>Create post</Button>
            </Link>
            <Link href="/my-routes" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" icon={<Sparkles size={14} color="currentColor" />}>Manage my routes</Button>
            </Link>
          </YStack>
        </RightRailCard>
      </YStack>
    </XStack>
  )
}

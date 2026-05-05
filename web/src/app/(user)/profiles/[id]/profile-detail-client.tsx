'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Button, Card, Image, RouteCard, Text, XStack, YStack } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { getProfileFollowers, getProfileFollowing, toggleProfileFollow } from '@/features/account/actions'
import type { ProfileConnection, PublicProfile, RouteListItem } from '@/types/api'
import { Compass, Image as ImageIcon, MessageCircle, Route, UserCheck, UserPlus, Users, X } from 'lucide-react'

function getInitials(name?: string | null) {
  const value = name?.trim()
  if (!value) return 'U'

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function routeToCardData(route: RouteListItem): RouteCardData {
  const owner = route.authorUserName?.trim()
  const source = route.originalAuthorName?.trim()

  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
    contentType: route.contentType,
    tag: source ? `Copy from ${source}` : owner ? `By ${owner}` : undefined,
  }
}

function ProfilePostCard({
  route,
  onOpen,
}: {
  route: RouteListItem
  onOpen: () => void
}) {
  const image = route.postImageUrls?.[0] ?? route.thumbnailUrl

  return (
    <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" padding="$0" overflow="hidden" pressable onPress={onOpen}>
      <YStack>
        <YStack height={190} backgroundColor="$muted">
          {image ? (
            <Image src={image} width="100%" height="100%" objectFit="cover" />
          ) : (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <ImageIcon size={28} color="var(--color-mutedForeground)" />
            </YStack>
          )}
        </YStack>
        <YStack padding="$4" gap="$3">
          <XStack gap="$2" flexWrap="wrap">
            <Badge variant={route.contentType === 'Official' ? 'info' : 'default'} size="sm">{route.contentType}</Badge>
            <Badge variant="success" size="sm">Public</Badge>
          </XStack>
          <YStack gap="$1.5">
            <Text variant="heading4" numberOfLines={2}>{route.title}</Text>
            <Text variant="body" muted numberOfLines={2}>
              {route.postContent?.trim() || route.description?.trim() || 'Shared a route update.'}
            </Text>
          </YStack>
          <XStack gap="$3" flexWrap="wrap">
            <Text variant="caption" muted>{route.postReactionCount ?? 0} likes</Text>
            <Text variant="caption" muted>{route.postCommentCount ?? 0} comments</Text>
            <Text variant="caption" muted>{route.postShareCount ?? 0} copies</Text>
          </XStack>
        </YStack>
      </YStack>
    </Card>
  )
}

function stopPropagation(e: unknown) {
  if (e && typeof e === 'object' && 'stopPropagation' in e && typeof (e as { stopPropagation?: unknown }).stopPropagation === 'function') {
    ;(e as { stopPropagation: () => void }).stopPropagation()
  }
}

function ProfileStat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  if (onPress) {
    return (
      <YStack
        flex={1}
        minWidth={150}
        alignItems="center"
        padding="$4"
        gap="$1"
        onPress={onPress}
        cursor="pointer"
        hoverStyle={{ backgroundColor: '$backgroundHover' }}
        pressStyle={{ backgroundColor: '$backgroundPress' }}
      >
        <Text variant="heading3" color="$primary">{value}</Text>
        <Text variant="caption" muted textTransform="uppercase">{label}</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} minWidth={150} alignItems="center" padding="$4" gap="$1">
      <Text variant="heading3">{value}</Text>
      <Text variant="caption" muted textTransform="uppercase">{label}</Text>
    </YStack>
  )
}

type ConnectionsTab = 'followers' | 'following'

function ProfileConnectionsModal({
  profile,
  tab,
  items,
  loading,
  error,
  onClose,
  onSelectProfile,
}: {
  profile: PublicProfile
  tab: ConnectionsTab
  items: ProfileConnection[]
  loading: boolean
  error: string | null
  onClose: () => void
  onSelectProfile: (userId: string) => void
}) {
  const title = tab === 'followers' ? 'Followers' : 'Following'
  const emptyCopy = tab === 'followers'
    ? `${profile.userName} does not have followers yet.`
    : `${profile.userName} is not following anyone yet.`

  return (
    <YStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={260}
      backgroundColor="rgba(15,23,42,0.48)"
      alignItems="center"
      justifyContent="center"
      padding="$4"
      style={{ backdropFilter: 'blur(8px)' }}
      onPress={onClose}
    >
      <YStack
        width={460}
        maxWidth="94vw"
        maxHeight="78vh"
        backgroundColor="$backgroundStrong"
        borderRadius="$5"
        borderWidth={1}
        borderColor="$borderColor"
        overflow="hidden"
        onPress={stopPropagation}
      >
        <XStack padding="$5" alignItems="center" justifyContent="space-between" borderBottomWidth={1} borderBottomColor="$borderColor">
          <YStack gap="$1">
            <Text variant="heading3">{title}</Text>
            <Text variant="caption" muted>{profile.userName}</Text>
          </YStack>
          <Button variant="ghost" size="sm" icon={<X size={18} color="currentColor" />} onPress={onClose} />
        </XStack>

        <YStack padding="$3" gap="$2" overflow="auto">
          {loading ? (
            <YStack padding="$6" alignItems="center" gap="$2">
              <Users size={22} color="var(--color-mutedForeground)" />
              <Text variant="caption" muted>Loading {title.toLowerCase()}…</Text>
            </YStack>
          ) : error ? (
            <YStack padding="$6" alignItems="center" gap="$2">
              <Text variant="label" color="$error500">Could not load {title.toLowerCase()}</Text>
              <Text variant="caption" muted align="center">{error}</Text>
            </YStack>
          ) : items.length === 0 ? (
            <YStack padding="$6" alignItems="center" gap="$2">
              <Users size={22} color="var(--color-mutedForeground)" />
              <Text variant="caption" muted align="center">{emptyCopy}</Text>
            </YStack>
          ) : (
            items.map((item) => (
              <XStack
                key={item.id}
                alignItems="center"
                gap="$3"
                padding="$3"
                borderRadius="$4"
                cursor="pointer"
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
                pressStyle={{ backgroundColor: '$backgroundPress' }}
                onPress={() => onSelectProfile(item.id)}
              >
                <Avatar size="md" initials={getInitials(item.userName)} src={item.profilePhotoUrl ?? undefined} />
                <YStack flex={1} minWidth={0}>
                  <Text variant="label" numberOfLines={1}>{item.userName}</Text>
                  <Text variant="caption" muted>
                    {item.isCurrentUser ? 'You' : item.isFollowingByCurrentUser ? 'Following' : 'View profile'}
                  </Text>
                </YStack>
                <Text variant="caption" color="$primary">Open</Text>
              </XStack>
            ))
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}

export default function PublicProfileClient({
  profile,
  posts,
  routes,
}: {
  profile: PublicProfile
  posts: RouteListItem[]
  routes: RouteListItem[]
}) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(profile.isFollowingByCurrentUser)
  const [followerCount, setFollowerCount] = useState(profile.followerCount)
  const [activeConnectionsTab, setActiveConnectionsTab] = useState<ConnectionsTab | null>(null)
  const [connections, setConnections] = useState<ProfileConnection[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!activeConnectionsTab) return

    let cancelled = false
    setConnectionsLoading(true)
    setConnectionsError(null)

    const loadConnections = activeConnectionsTab === 'followers' ? getProfileFollowers : getProfileFollowing
    loadConnections(profile.id)
      .then((items) => {
        if (!cancelled) setConnections(items)
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setConnections([])
          setConnectionsError(e.message || 'Request failed')
        }
      })
      .finally(() => {
        if (!cancelled) setConnectionsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeConnectionsTab, profile.id])

  const openConnections = (tab: ConnectionsTab) => {
    setConnections([])
    setActiveConnectionsTab(tab)
  }

  const handleSelectProfile = (userId: string) => {
    setActiveConnectionsTab(null)
    router.push(`/profiles/${userId}`)
  }

  const handleFollow = () => {
    if (profile.isCurrentUser || isPending) return

    startTransition(async () => {
      const result = await toggleProfileFollow(profile.id)
      setIsFollowing(result.isFollowingByCurrentUser)
      setFollowerCount(result.followerCount)
    })
  }

  return (
    <YStack gap="$6" flex={1}>
      <Card variant="outline" size="md" backgroundColor="$backgroundStrong" padding="$0" overflow="hidden">
        <XStack gap="$5" alignItems="center" flexWrap="wrap" padding="$5">
          <Avatar size="xl" initials={getInitials(profile.userName)} src={profile.profilePhotoUrl ?? undefined} />
          <YStack flex={1} gap="$2" minWidth={220}>
            <Text variant="heading2">{profile.userName}</Text>
            <Text variant="body" muted>
              {profile.isCurrentUser ? 'Your public profile' : 'Route creator profile'}
            </Text>
          </YStack>
          <XStack gap="$2" flexWrap="wrap">
            {profile.isCurrentUser ? (
              <Button variant="outline" size="md" onPress={() => router.push('/settings')}>
                Edit profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'solid'}
                size="md"
                loading={isPending}
                disabled={isPending}
                icon={isFollowing ? <UserCheck size={16} color="currentColor" /> : <UserPlus size={16} color="currentColor" />}
                onPress={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </XStack>
        </XStack>
        <XStack borderTopWidth={1} borderTopColor="$borderColor" flexWrap="wrap">
          <ProfileStat value={followerCount} label="Followers" onPress={() => openConnections('followers')} />
          <ProfileStat value={profile.followingCount} label="Following" onPress={() => openConnections('following')} />
          <ProfileStat value={profile.postCount} label="Posts" />
          <ProfileStat value={profile.publicRouteCount} label="Public routes" />
        </XStack>
      </Card>

      {activeConnectionsTab ? (
        <ProfileConnectionsModal
          profile={profile}
          tab={activeConnectionsTab}
          items={connections}
          loading={connectionsLoading}
          error={connectionsError}
          onClose={() => setActiveConnectionsTab(null)}
          onSelectProfile={handleSelectProfile}
        />
      ) : null}

      <YStack gap="$4">
        <XStack alignItems="center" gap="$2">
          <MessageCircle size={20} color="var(--color-primary)" />
          <Text variant="heading3">Posts</Text>
        </XStack>
        {posts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {posts.map((post) => (
              <ProfilePostCard
                key={`${post.postId ?? post.id}-${post.createdAt}`}
                route={post}
                onOpen={() => router.push(`/routes/${post.id}`)}
              />
            ))}
          </div>
        ) : (
          <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$3" padding="$5" backgroundColor="$backgroundStrong" alignItems="center" gap="$2">
            <Users size={24} color="var(--color-mutedForeground)" />
            <Text variant="label">No public posts yet</Text>
            <Text variant="caption" muted>This creator has not shared a route post.</Text>
          </YStack>
        )}
      </YStack>

      <YStack gap="$4">
        <XStack alignItems="center" gap="$2">
          <Route size={20} color="var(--color-primary)" />
          <Text variant="heading3">Public Routes</Text>
        </XStack>
        {routes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                data={routeToCardData(route)}
                onPress={() => router.push(`/routes/${route.id}`)}
              />
            ))}
          </div>
        ) : (
          <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$3" padding="$5" backgroundColor="$backgroundStrong" alignItems="center" gap="$2">
            <Compass size={24} color="var(--color-mutedForeground)" />
            <Text variant="label">No public routes yet</Text>
            <Text variant="caption" muted>Published routes will appear here.</Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

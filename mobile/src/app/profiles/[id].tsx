import React, { useEffect, useState, useTransition } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Avatar, Badge, Button, Card, Image, ScrollView, Text, XStack, YStack } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { getPublicProfile, toggleProfileFollow } from '@/features/account/api'
import { getFeedPosts } from '@/features/posts/api'
import { mapFeedPostsToRouteCards } from '@/features/posts/mappers'
import { getRoutes } from '@/features/routes/api'
import type { PublicProfile, RouteListItem } from '@/features/api/types'

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

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <YStack flex={1} minWidth={120} alignItems="center" padding="$3" gap="$1">
      <Text variant="heading3">{value}</Text>
      <Text variant="caption" muted textTransform="uppercase" align="center">{label}</Text>
    </YStack>
  )
}

function ProfilePostCard({ route, onOpen }: { route: RouteListItem; onOpen: () => void }) {
  const image = route.postImageUrls?.[0] ?? route.thumbnailUrl

  return (
    <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" padding="$0" overflow="hidden" pressable onPress={onOpen}>
      <YStack>
        <YStack height={190} backgroundColor="$muted">
          {image ? (
            <Image src={image} width="100%" height="100%" objectFit="cover" />
          ) : (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <Feather name="image" size={28} color="var(--color-mutedForeground, #999)" />
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

function PublicRouteCard({ route, onOpen }: { route: RouteListItem; onOpen: () => void }) {
  return (
    <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" pressable onPress={onOpen} gap="$3">
      <XStack gap="$3" alignItems="center">
        <YStack width={86} height={86} borderRadius="$3" overflow="hidden" backgroundColor="$muted">
          {route.thumbnailUrl ? (
            <Image src={route.thumbnailUrl} width="100%" height="100%" objectFit="cover" />
          ) : (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <Feather name="map" size={22} color="var(--color-mutedForeground, #999)" />
            </YStack>
          )}
        </YStack>
        <YStack flex={1} gap="$1.5">
          <XStack gap="$2" flexWrap="wrap">
            <Badge variant={route.contentType === 'Official' ? 'info' : 'default'} size="sm">{route.contentType}</Badge>
            {route.averageRating > 0 ? <Badge variant="warning" size="sm">★ {route.averageRating.toFixed(1)}</Badge> : null}
          </XStack>
          <Text variant="label" numberOfLines={2}>{route.title}</Text>
          {route.description ? <Text variant="caption" muted numberOfLines={2}>{route.description}</Text> : null}
        </YStack>
        <Feather name="chevron-right" size={16} color="var(--color-mutedForeground, #999)" />
      </XStack>
    </Card>
  )
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [isPending, startTransition] = useTransition()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [posts, setPosts] = useState<RouteListItem[]>([])
  const [routes, setRoutes] = useState<RouteListItem[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let mounted = true
    setLoading(true)
    setError(null)

    Promise.allSettled([
      getPublicProfile(id),
      getFeedPosts('timeline', 1, 12, id),
      getRoutes({ authorId: id, visibility: 'public', pageSize: 12, sort: 'newest' }),
    ]).then(([profileResult, postsResult, routesResult]) => {
      if (!mounted) return

      if (profileResult.status === 'rejected') {
        setError(profileResult.reason instanceof Error ? profileResult.reason.message : 'Could not load profile.')
        setProfile(null)
      } else {
        setProfile(profileResult.value)
        setIsFollowing(profileResult.value.isFollowingByCurrentUser)
        setFollowerCount(profileResult.value.followerCount)
      }

      setPosts(postsResult.status === 'fulfilled' ? mapFeedPostsToRouteCards(postsResult.value.data) : [])
      setRoutes(routesResult.status === 'fulfilled' ? routesResult.value.data : [])
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [id])

  const handleFollow = () => {
    if (!profile || profile.isCurrentUser || isPending) return

    startTransition(async () => {
      try {
        const result = await toggleProfileFollow(profile.id)
        setIsFollowing(result.isFollowingByCurrentUser)
        setFollowerCount(result.followerCount)
      } catch (e) {
        setError((e as Error).message ?? 'Failed to update follow status.')
      }
    })
  }

  if (loading) {
    return (
      <YStack flex={1} backgroundColor="$background" paddingHorizontal="$4" paddingTop={insets.top + 24} gap="$4">
        <Text variant="heading3">Loading profile...</Text>
        <Text variant="body" muted>Fetching creator details, posts, and public routes.</Text>
      </YStack>
    )
  }

  if (!profile) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$5" gap="$3">
        <Feather name="user-x" size={30} color="var(--color-mutedForeground, #999)" />
        <Text variant="heading4">Profile not available</Text>
        <Text variant="body" muted align="center">{error ?? 'We could not load this creator profile.'}</Text>
        <Button variant="outline" onPress={() => router.back()}>Go Back</Button>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop={insets.top + 12} paddingBottom={120} gap="$5">
          <XStack alignItems="center" gap="$2" onPress={() => router.back()}>
            <Feather name="arrow-left" size={16} color="currentColor" />
            <Text variant="label">Back</Text>
          </XStack>

          <Card variant="outline" size="md" backgroundColor="$backgroundStrong" padding="$0" overflow="hidden">
            <YStack padding="$5" gap="$4" alignItems="center">
              <Avatar size="xl" initials={getInitials(profile.userName)} src={profile.profilePhotoUrl ?? undefined} />
              <YStack gap="$1" alignItems="center">
                <Text variant="heading2" align="center">{profile.userName}</Text>
                <Text variant="body" muted align="center">
                  {profile.isCurrentUser ? 'Your public profile' : 'Route creator profile'}
                </Text>
              </YStack>
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
                  icon={<Feather name={isFollowing ? 'user-check' : 'user-plus'} size={16} color="currentColor" />}
                  onPress={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </YStack>
            <XStack borderTopWidth={1} borderTopColor="$borderColor" flexWrap="wrap">
              <ProfileStat value={followerCount} label="Followers" />
              <ProfileStat value={profile.followingCount} label="Following" />
              <ProfileStat value={profile.postCount} label="Posts" />
              <ProfileStat value={profile.publicRouteCount} label="Public routes" />
            </XStack>
          </Card>

          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <Feather name="message-circle" size={20} color="var(--color-primary)" />
              <Text variant="heading3">Posts</Text>
            </XStack>
            {posts.length > 0 ? (
              <YStack gap="$3">
                {posts.map((post) => (
                  <ProfilePostCard
                    key={`${post.postId ?? post.id}-${post.createdAt}`}
                    route={post}
                    onOpen={() => router.push(`/routes/${post.id}`)}
                  />
                ))}
              </YStack>
            ) : (
              <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$3" padding="$5" backgroundColor="$backgroundStrong" alignItems="center" gap="$2">
                <Feather name="users" size={24} color="var(--color-mutedForeground, #999)" />
                <Text variant="label">No public posts yet</Text>
                <Text variant="caption" muted align="center">This creator has not shared a route post.</Text>
              </YStack>
            )}
          </YStack>

          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <Feather name="navigation" size={20} color="var(--color-primary)" />
              <Text variant="heading3">Public Routes</Text>
            </XStack>
            {routes.length > 0 ? (
              <YStack gap="$3">
                {routes.map((route) => (
                  <PublicRouteCard
                    key={route.id}
                    route={route}
                    onOpen={() => router.push(`/routes/${route.id}`)}
                  />
                ))}
              </YStack>
            ) : (
              <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$3" padding="$5" backgroundColor="$backgroundStrong" alignItems="center" gap="$2">
                <Feather name="compass" size={24} color="var(--color-mutedForeground, #999)" />
                <Text variant="label">No public routes yet</Text>
                <Text variant="caption" muted align="center">Published routes will appear here.</Text>
              </YStack>
            )}
          </YStack>

          {error ? <Text variant="caption" color="$error500">{error}</Text> : null}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

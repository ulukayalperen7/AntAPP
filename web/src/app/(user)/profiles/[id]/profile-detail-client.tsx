'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Button, Card, Image, RouteCard, Text, XStack, YStack } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import { toggleProfileFollow } from '@/features/account/actions'
import type { PublicProfile, RouteListItem } from '@/types/api'
import { Compass, Image as ImageIcon, MessageCircle, Route, UserCheck, UserPlus, Users } from 'lucide-react'

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

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <YStack flex={1} minWidth={150} alignItems="center" padding="$4" gap="$1">
      <Text variant="heading3">{value}</Text>
      <Text variant="caption" muted textTransform="uppercase">{label}</Text>
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
  const [isPending, startTransition] = useTransition()

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
          <ProfileStat value={followerCount} label="Followers" />
          <ProfileStat value={profile.followingCount} label="Following" />
          <ProfileStat value={profile.postCount} label="Posts" />
          <ProfileStat value={profile.publicRouteCount} label="Public routes" />
        </XStack>
      </Card>

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

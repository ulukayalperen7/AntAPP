import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'expo-router'
import { Avatar, Badge, Button, Card, Image, Input, ScrollView, Text, XStack, YStack } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Share } from 'react-native'
import { useAuth } from '@/features/auth/context'
import { getRoutes } from '@/features/routes/api'
import { addPostComment, getFeedPosts, getPostComments, getPostReactions, sharePost, togglePostReaction } from '@/features/posts/api'
import { mapFeedPostsToRouteCards } from '@/features/posts/mappers'
import type { PostCommentItem, PostReactionItem, RouteListItem } from '@/features/api/types'
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

function getAuthor(route: RouteListItem) {
  if (route.contentType === 'Official') {
    return {
      name: 'AntAPP Official',
      role: 'Curated route desk',
      initials: 'AO',
    }
  }

  const displayName = route.authorUserName?.trim() || 'Route Explorer'

  return {
    name: displayName,
    role: 'Route creator',
    initials: getInitials(displayName),
  }
}

function formatSocialCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
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
          <Text variant="label" align="center">Create Post</Text>
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

const COMMENTS_PAGE_SIZE = 20
const REACTIONS_PAGE_SIZE = 20

function FeedPostCard({
  route,
  onPress,
  onOpenProfile,
  onCreatePost,
}: {
  route: RouteListItem
  onPress: () => void
  onOpenProfile: () => void
  onCreatePost: () => void
}) {
  const tone = getPostTone(route)
  const author = getAuthor(route)
  const media = route.postImageUrls?.length ? route.postImageUrls : (route.thumbnailUrl ? [route.thumbnailUrl] : [])
  const coverImage = media[0] ?? null
  const postId = route.postId ?? null
  const isInteractivePost = Boolean(postId)

  const [reactionCount, setReactionCount] = useState(route.postReactionCount ?? 0)
  const [commentCount, setCommentCount] = useState(route.postCommentCount ?? 0)
  const [shareCount, setShareCount] = useState(route.postShareCount ?? 0)
  const [isReacted, setIsReacted] = useState(route.isReactedByCurrentUser ?? false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isReactionsOpen, setIsReactionsOpen] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [reactionsLoaded, setReactionsLoaded] = useState(false)
  const [comments, setComments] = useState<PostCommentItem[]>([])
  const [reactions, setReactions] = useState<PostReactionItem[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [socialError, setSocialError] = useState<string | null>(null)
  const [shareNotice, setShareNotice] = useState<string | null>(null)

  const [isLiking, startLiking] = useTransition()
  const [isCommentLoading, startCommentLoading] = useTransition()
  const [isReactionLoading, startReactionLoading] = useTransition()
  const [isCommentPosting, startCommentPosting] = useTransition()
  const [isSharing, startSharing] = useTransition()

  const openCreatePost = () => {
    onCreatePost()
  }

  const loadComments = () => {
    if (!postId) return

    startCommentLoading(async () => {
      try {
        const response = await getPostComments(postId, 1, COMMENTS_PAGE_SIZE)
        setComments(response.data)
        setCommentsLoaded(true)
        setCommentCount((current) => Math.max(current, response.totalRecords))
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to load comments.')
      }
    })
  }

  const loadReactions = () => {
    if (!postId) return

    startReactionLoading(async () => {
      try {
        const response = await getPostReactions(postId, 1, REACTIONS_PAGE_SIZE)
        setReactions(response.data)
        setReactionsLoaded(true)
        setReactionCount((current) => Math.max(current, response.totalRecords))
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to load likes.')
      }
    })
  }

  const handleToggleReaction = () => {
    if (!postId || isLiking) {
      if (!postId) openCreatePost()
      return
    }

    startLiking(async () => {
      try {
        const result = await togglePostReaction(postId)
        setIsReacted(result.isReactedByCurrentUser)
        setReactionCount(result.reactionCount)
        setReactionsLoaded(false)
        if (isReactionsOpen) loadReactions()
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to update reaction.')
      }
    })
  }

  const handleToggleComments = () => {
    if (!postId) {
      openCreatePost()
      return
    }

    const nextOpen = !isCommentsOpen
    setIsCommentsOpen(nextOpen)
    if (nextOpen && !commentsLoaded) loadComments()
  }

  const handleToggleReactions = () => {
    if (!postId) {
      openCreatePost()
      return
    }

    const nextOpen = !isReactionsOpen
    setIsReactionsOpen(nextOpen)
    if (nextOpen && !reactionsLoaded) loadReactions()
  }

  const handleAddComment = () => {
    if (!postId || isCommentPosting) return

    const content = commentDraft.trim()
    if (!content) {
      setSocialError('Comment cannot be empty.')
      return
    }

    startCommentPosting(async () => {
      try {
        const result = await addPostComment(postId, content)
        setCommentCount(result.commentCount)
        setCommentDraft('')
        setCommentsLoaded(false)
        if (isCommentsOpen) loadComments()
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to post comment.')
      }
    })
  }

  const handleShare = () => {
    if (!postId) {
      openCreatePost()
      return
    }

    startSharing(async () => {
      try {
        const result = await sharePost(postId)
        setShareCount(result.shareCount)
        await Share.share({
          title: route.title,
          message: `Check out this route: ${route.title}`,
        })
        setShareNotice('Share saved.')
        setSocialError(null)
      } catch (e) {
        setShareNotice(null)
        setSocialError((e as Error).message ?? 'Failed to share post.')
      }
    })
  }

  return (
    <Card
      variant="outline"
      size="sm"
      backgroundColor="$backgroundStrong"
      gap="$4"
    >
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
        <XStack gap="$3" flex={1}>
          <XStack onPress={onOpenProfile}>
            <Avatar size="lg" initials={author.initials} />
          </XStack>
          <YStack gap="$1.5" flex={1}>
            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Text variant="label" onPress={onOpenProfile}>{author.name}</Text>
              <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
            </XStack>
            <Text variant="caption" muted>{author.role}</Text>
            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Text variant="caption" muted>{formatRelativeDate(route.createdAt)}</Text>
              <Text variant="caption" muted>•</Text>
              <Text variant="caption" muted>{isInteractivePost ? tone.label : 'Route preview'}</Text>
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
          {route.postContent?.trim() || route.description?.trim() || 'A newly shared route just dropped into the public feed. Open the post to inspect the route map, stops, and full detail.'}
        </Text>
      </YStack>

      <YStack
        borderRadius="$4"
        overflow="hidden"
        backgroundColor="$muted"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack height={260} maxHeight={260} flexShrink={0} backgroundColor="$muted" onPress={onPress}>
          {coverImage ? (
            <Image src={coverImage} width="100%" height="100%" objectFit="cover" />
          ) : null}
        </YStack>

        <YStack padding="$4" gap="$3" backgroundColor="$background">
          <XStack gap="$2" flexWrap="wrap">
            <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
            <Badge variant="success" size="sm">{route.isPublic ? 'Public' : 'Draft'}</Badge>
          </XStack>

          <YStack gap="$2">
            <Text variant="label" color="$primary">{isInteractivePost ? 'Post details' : 'Route snapshot'}</Text>
            <Text variant="body" muted>
              {isInteractivePost
                ? `Shared on ${formatFullDate(route.createdAt)}. People can like, comment, and share this route.`
                : `Published ${formatFullDate(route.createdAt)}. Publish this route as a post to enable social actions.`}
            </Text>
          </YStack>

          {media.length > 1 ? (
            <XStack gap="$2">
              {media.slice(1, 4).map((url, index) => (
                <YStack key={`${route.postId ?? route.id}-${index}`} width={58} height={44} borderRadius="$2" overflow="hidden" backgroundColor="$muted">
                  <Image src={url} width="100%" height="100%" objectFit="cover" />
                </YStack>
              ))}
            </XStack>
          ) : null}

          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="caption" muted>Average rating</Text>
            <XStack alignItems="center" gap="$1">
              <Feather name="star" size={14} color="#F59E0B" />
              <Text variant="caption" weight="semibold">
                {route.averageRating > 0 ? route.averageRating.toFixed(1) : 'New'}
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </YStack>

      {isInteractivePost ? (
        <>
          <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
            <XStack onPress={handleToggleReactions} paddingVertical="$1" paddingHorizontal="$2">
              <Text variant="caption" color={isReactionsOpen ? '$primary' : '$mutedForeground'}>
                {formatSocialCount(reactionCount, 'like', 'likes')}
              </Text>
            </XStack>
            <XStack onPress={handleToggleComments} paddingVertical="$1" paddingHorizontal="$2">
              <Text variant="caption" color={isCommentsOpen ? '$primary' : '$mutedForeground'}>
                {formatSocialCount(commentCount, 'comment', 'comments')}
              </Text>
            </XStack>
            <Text variant="caption" muted paddingVertical="$1" paddingHorizontal="$2">
              {formatSocialCount(shareCount, 'share', 'shares')}
            </Text>
          </XStack>

          <XStack
            borderTopWidth={1}
            borderTopColor="$borderColor"
            paddingTop="$3"
            justifyContent="space-between"
            gap="$2"
            flexWrap="wrap"
          >
            <Button variant={isReacted ? 'solid' : 'ghost'} size="sm" loading={isLiking} disabled={isLiking} icon={<Feather name="thumbs-up" size={16} color="currentColor" />} onPress={handleToggleReaction}>
              Like
            </Button>
            <Button variant={isCommentsOpen ? 'outline' : 'ghost'} size="sm" icon={<Feather name="message-circle" size={16} color="currentColor" />} onPress={handleToggleComments}>
              Comment
            </Button>
            <Button variant="ghost" size="sm" loading={isSharing} disabled={isSharing} icon={<Feather name="share-2" size={16} color="currentColor" />} onPress={handleShare}>
              Share
            </Button>
          </XStack>

          {shareNotice ? <Text variant="caption" color="$success500">{shareNotice}</Text> : null}
        </>
      ) : (
        <YStack gap="$2">
          <Text variant="caption" muted>Publish this route as a post to enable likes, comments, and shares.</Text>
          <Button variant="outline" size="sm" onPress={() => openCreatePost()}>
            Publish as post
          </Button>
        </YStack>
      )}

      {isReactionsOpen ? (
        <YStack gap="$3" borderTopWidth={1} borderTopColor="$borderColor" paddingTop="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="label">Liked by</Text>
            <Text variant="caption" muted>{formatSocialCount(reactionCount, 'like', 'likes')}</Text>
          </XStack>

          {isReactionLoading ? (
            <Text variant="caption" muted>Loading likes...</Text>
          ) : reactions.length === 0 ? (
            <Text variant="caption" muted>No likes yet.</Text>
          ) : (
            <YStack gap="$2">
              {reactions.map((reaction) => (
                <XStack key={reaction.reactionId} gap="$2.5" alignItems="center">
                  <Avatar size="sm" initials={getInitials(reaction.userName)} />
                  <YStack flex={1} gap="$0.5">
                    <Text variant="label">{reaction.userName?.trim() || 'Route Explorer'}</Text>
                    <Text variant="caption" muted>{formatRelativeDate(reaction.createdAt)}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      ) : null}

      {isCommentsOpen ? (
        <YStack gap="$3" borderTopWidth={1} borderTopColor="$borderColor" paddingTop="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text variant="label">Comments</Text>
            <Text variant="caption" muted>{formatSocialCount(commentCount, 'comment', 'comments')}</Text>
          </XStack>

          <XStack gap="$2">
            <Input
              value={commentDraft}
              onChangeText={setCommentDraft}
              variant="outline"
              placeholder="Write a comment..."
              flex={1}
            />
            <Button variant="solid" size="sm" loading={isCommentPosting} disabled={isCommentPosting} onPress={handleAddComment}>
              Post
            </Button>
          </XStack>

          {isCommentLoading ? (
            <Text variant="caption" muted>Loading comments...</Text>
          ) : comments.length === 0 ? (
            <YStack backgroundColor="$background" borderRadius="$3" padding="$3" borderWidth={1} borderColor="$borderColor">
              <Text variant="caption" muted>No comments yet. Start the conversation.</Text>
            </YStack>
          ) : (
            <YStack gap="$2">
              {comments.map((comment) => (
                <XStack key={comment.commentId} gap="$2.5" alignItems="flex-start" backgroundColor="$background" borderRadius="$3" padding="$3">
                  <Avatar size="sm" initials={getInitials(comment.userName)} />
                  <YStack flex={1} gap="$1">
                    <XStack gap="$2" alignItems="center" flexWrap="wrap">
                      <Text variant="label">{comment.userName?.trim() || 'Route Explorer'}</Text>
                      <Text variant="caption" muted>{formatRelativeDate(comment.createdAt)}</Text>
                    </XStack>
                    <Text variant="body">{comment.content}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      ) : null}

      {socialError ? <Text variant="caption" color="$error500">{socialError}</Text> : null}
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
      getFeedPosts('timeline', 1, 10),
      getRoutes({ sort: 'newest', pageSize: 10 }),
      getRoutes({ sort: 'rating', type: 'official', pageSize: 5 }),
    ]).then((results) => {
      if (!mounted) return

      const [feedResult, fallbackResult, spotlightResult] = results
      const feedRoutes = feedResult.status === 'fulfilled'
        ? mapFeedPostsToRouteCards(feedResult.value.data)
        : []
      const fallbackRoutes = fallbackResult.status === 'fulfilled' ? fallbackResult.value.data : []

      setTimelineRoutes(feedRoutes.length > 0 ? feedRoutes : fallbackRoutes)
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
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Avatar size="lg" initials={user?.userName?.charAt(0)?.toUpperCase() ?? 'A'} />
              <YStack flex={1} minWidth={160} gap="$1">
                <Text variant="label">Create a route post</Text>
                <Text variant="caption" muted>{PAGE_COPY.composer}</Text>
              </YStack>
              <Button
                variant="solid"
                size="sm"
                icon={<Feather name="plus" size={14} color="#FFFFFF" />}
                onPress={() => router.push('/posts/create')}
              >
                Create post
              </Button>
            </XStack>
          </Card>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$3" paddingBottom="$1">
              <StoryCard action onPress={() => router.push('/posts/create')} />
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
                  key={route.postId ?? route.id}
                  route={route}
                  onPress={() => router.push(`/routes/${route.id}`)}
                  onOpenProfile={() => router.push(`/profiles/${route.authorUserId}`)}
                  onCreatePost={() => router.push(`/posts/create?routeId=${route.id}`)}
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
                onPress={() => router.push('/posts/create')}
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

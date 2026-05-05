import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'expo-router'
import { Avatar, Badge, Button, Card, Image, Input, ScrollView, Text, XStack, YStack } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Share } from 'react-native'
import { useAuth } from '@/features/auth/context'
import { getRoutes } from '@/features/routes/api'
import { addPostComment, deletePostComment, updatePostComment, getFeedPosts, getPostComments, getPostReactions, sharePost, togglePostReaction } from '@/features/posts/api'
import { mapFeedPostsToRouteCards } from '@/features/posts/mappers'
import type { PostCommentItem, PostReactionItem, RouteListItem } from '@/features/api/types'
import { HomeScreenSkeleton } from '@/components/loading/page-skeletons'
import { RouteMapChip } from '@/components/map/route-map-chip'

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
  currentUserName,
}: {
  route: RouteListItem
  onPress: () => void
  onOpenProfile: () => void
  onCreatePost: () => void
  currentUserName?: string | null
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
  const [isFollowed, setIsFollowed] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isReactionsOpen, setIsReactionsOpen] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [reactionsLoaded, setReactionsLoaded] = useState(false)
  const [comments, setComments] = useState<PostCommentItem[]>([])
  const [reactions, setReactions] = useState<PostReactionItem[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [socialError, setSocialError] = useState<string | null>(null)
  const [shareNotice, setShareNotice] = useState<string | null>(null)

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

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

  const handleDeleteComment = (commentId: string) => {
    if (!postId || isCommentPosting) return
    startCommentPosting(async () => {
      try {
        await deletePostComment(postId, commentId)
        setComments(current => current.filter(c => c.commentId !== commentId))
        setCommentCount(c => Math.max(0, c - 1))
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to delete comment.')
      }
    })
  }

  const handleStartEdit = (comment: PostCommentItem) => {
    setEditingCommentId(comment.commentId)
    setEditDraft(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditDraft('')
  }

  const handleSaveEdit = (commentId: string) => {
    if (!postId || isCommentPosting) return
    const content = editDraft.trim()
    if (!content) return
    startCommentPosting(async () => {
      try {
        await updatePostComment(postId, commentId, content)
        setComments(current => current.map(c => c.commentId === commentId ? { ...c, content } : c))
        setEditingCommentId(null)
        setEditDraft('')
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to update comment.')
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
    <YStack backgroundColor="$backgroundStrong" borderBottomWidth={1} borderBottomColor="$borderColor">
      {/* Author row */}
      <XStack gap="$2.5" alignItems="center" paddingHorizontal="$3" paddingVertical="$2.5">
        <XStack onPress={onOpenProfile}>
          <Avatar size="sm" initials={author.initials} />
        </XStack>
        <XStack flex={1} gap="$2" alignItems="center" onPress={onOpenProfile}>
          <Text variant="label">{author.name}</Text>
          <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
        </XStack>
        {currentUserName !== route.authorUserName ? (
          <Button
            variant={isFollowed ? 'outline' : 'ghost'}
            size="sm"
            onPress={() => setIsFollowed(f => !f)}
          >
            {isFollowed ? 'Followed' : 'Follow'}
          </Button>
        ) : null}
        <XStack paddingLeft="$1">
          <Feather name="more-horizontal" size={16} color="currentColor" />
        </XStack>
      </XStack>

      {/* Full-width image */}
      <YStack
        width="100%"
        height={400}
        backgroundColor="$muted"
        overflow="hidden"
        position="relative"
        onPress={onPress}
      >
        {coverImage ? (
          <Image src={coverImage} width="100%" height="100%" objectFit="cover" />
        ) : (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Feather name="compass" size={36} color="currentColor" />
          </YStack>
        )}

        <RouteMapChip routeId={route.id} onPress={onPress} />
      </YStack>

      {/* Action icons */}
      <XStack paddingHorizontal="$3" paddingTop="$3" paddingBottom="$1" justifyContent="space-between" alignItems="center">
        <XStack gap="$4" alignItems="center">
          <XStack onPress={handleToggleReaction} opacity={isLiking ? 0.4 : 1}>
            <Feather
              name="thumbs-up"
              size={22}
              color={isReacted ? 'var(--color-primary)' : 'currentColor'}
            />
          </XStack>
          <XStack onPress={handleToggleComments}>
            <Feather name="message-circle" size={22} color="currentColor" />
          </XStack>
          <XStack onPress={handleShare} opacity={isSharing ? 0.4 : 1}>
            <Feather name="share-2" size={22} color="currentColor" />
          </XStack>
        </XStack>
        <XStack onPress={onPress}>
          <Feather name="compass" size={22} color="currentColor" />
        </XStack>
      </XStack>

      {/* Like count */}
      {reactionCount > 0 ? (
        <XStack paddingHorizontal="$3" paddingTop="$1" onPress={handleToggleReactions}>
          <Text variant="label">{formatSocialCount(reactionCount, 'like', 'likes')}</Text>
        </XStack>
      ) : null}

      {/* Route title + caption inline */}
      <XStack paddingHorizontal="$3" paddingTop="$1.5" paddingBottom="$0.5" flexWrap="wrap" gap="$1.5" alignItems="flex-start">
        <Text variant="label">{route.title}</Text>
        {(route.postContent?.trim() || route.description?.trim()) ? (
          <Text variant="body" numberOfLines={2} color="$color">
            {route.postContent?.trim() || route.description?.trim()}
          </Text>
        ) : null}
      </XStack>

      {/* View all comments */}
      {isInteractivePost && commentCount > 0 ? (
        <XStack paddingHorizontal="$3" paddingTop="$0.5" onPress={handleToggleComments}>
          <Text variant="caption" muted>View all {commentCount} comments</Text>
        </XStack>
      ) : null}

      {/* Publish prompt */}
      {!isInteractivePost ? (
        <XStack paddingHorizontal="$3" paddingTop="$1" onPress={() => openCreatePost()}>
          <Text variant="caption" color="$primary">Publish as post →</Text>
        </XStack>
      ) : null}

      {shareNotice ? (
        <XStack paddingHorizontal="$3" paddingTop="$1">
          <Text variant="caption" color="$success500">{shareNotice}</Text>
        </XStack>
      ) : null}
      {socialError ? (
        <XStack paddingHorizontal="$3">
          <Text variant="caption" color="$error500">{socialError}</Text>
        </XStack>
      ) : null}

      {/* Timestamp */}
      <Text variant="caption" muted paddingHorizontal="$3" paddingTop="$1" paddingBottom="$3">
        {formatRelativeDate(route.createdAt)}
      </Text>

      {/* Reactions panel */}
      {isReactionsOpen ? (
        <YStack gap="$3" borderTopWidth={1} borderTopColor="$borderColor" paddingHorizontal="$3" paddingTop="$3" paddingBottom="$3">
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

      {/* Comments panel */}
      {isCommentsOpen ? (
        <YStack gap="$3" borderTopWidth={1} borderTopColor="$borderColor" paddingHorizontal="$3" paddingTop="$3" paddingBottom="$3">
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
            <Text variant="caption" muted>No comments yet.</Text>
          ) : (
            <YStack gap="$2.5">
              {comments.map((comment) => {
                const isOwn = Boolean(currentUserName && comment.userName === currentUserName)
                const isEditing = editingCommentId === comment.commentId
                return (
                  <XStack key={comment.commentId} gap="$2" alignItems="flex-start">
                    <Avatar size="sm" initials={getInitials(comment.userName)} />
                    <YStack flex={1} gap="$0.5">
                      <XStack gap="$1.5" alignItems="center" flexWrap="wrap">
                        <Text variant="label">{comment.userName?.trim() || 'Route Explorer'}</Text>
                        <Text variant="caption" muted>{formatRelativeDate(comment.createdAt)}</Text>
                        {isOwn && !isEditing ? (
                          <>
                            <Text variant="caption" muted onPress={() => handleStartEdit(comment)}>Düzenle</Text>
                            <Text variant="caption" muted onPress={() => handleDeleteComment(comment.commentId)}>Sil</Text>
                          </>
                        ) : null}
                      </XStack>
                      {isEditing ? (
                        <YStack gap="$2">
                          <Input
                            value={editDraft}
                            onChangeText={setEditDraft}
                            variant="outline"
                            placeholder="Edit comment..."
                          />
                          <XStack gap="$2">
                            <Button variant="solid" size="sm" loading={isCommentPosting} disabled={isCommentPosting} onPress={() => handleSaveEdit(comment.commentId)}>
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" disabled={isCommentPosting} onPress={handleCancelEdit}>
                              Cancel
                            </Button>
                          </XStack>
                        </YStack>
                      ) : (
                        <Text variant="body">{comment.content}</Text>
                      )}
                    </YStack>
                  </XStack>
                )
              })}
            </YStack>
          )}
        </YStack>
      ) : null}
    </YStack>
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
      <YStack gap="$0.5">
        <Text variant="heading4">{title}</Text>
        {subtitle ? <Text variant="caption" muted>{subtitle}</Text> : null}
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
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Avatar size="lg" initials={user?.userName?.charAt(0)?.toUpperCase() ?? 'A'} />
              <Text variant="label" flex={1} minWidth={160}>Create a route post</Text>
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

          <YStack>
            {timelineRoutes.length > 0 ? (
              timelineRoutes.map((route) => (
                <FeedPostCard
                  key={route.postId ?? route.id}
                  route={route}
                  onPress={() => router.push(`/routes/${route.id}`)}
                  onOpenProfile={() => router.push(`/profiles/${route.authorUserId}`)}
                  onCreatePost={() => router.push(`/posts/create?routeId=${route.id}`)}
                  currentUserName={user?.userName}
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

          <RailCard title="Sponsored" subtitle="">
            <YStack
              borderRadius="$4"
              overflow="hidden"
              backgroundColor="$muted"
              height={148}
            >
              {spotlightRoutes[0]?.thumbnailUrl ? (
                <Image src={spotlightRoutes[0].thumbnailUrl} width="100%" height="100%" objectFit="cover" />
              ) : null}
            </YStack>
          </RailCard>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

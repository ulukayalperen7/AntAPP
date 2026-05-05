'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Badge, Button, Card, Image, Input, Text, XStack, YStack } from '@antapp/ui'
import { addPostComment, deletePostComment, getPostComments, getPostReactions, sharePost, togglePostReaction } from '@/features/posts/actions'
import type { PostCommentItem, PostReactionItem, RouteListItem } from '@/types/api'
import { Bell, CircleDot, Clock3, Compass, Copy, Ellipsis, MessageCircle, Plus, Sparkles, Star, ThumbsUp, Trash2 } from 'lucide-react'
import { MiniHeatmap } from '@/components/mini-heatmap'

type FeedMode = 'timeline' | 'official' | 'community'
const COMMENTS_PAGE_SIZE = 20
const REACTIONS_PAGE_SIZE = 20

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
    subtitle: 'A social feed for public route posts. Use Search or Spots when you only want to browse routes.',
    composer: 'Choose a public route, add a caption, and attach optional photos.',
    railTitle: 'Trending now',
    railSubtitle: 'Public routes and posts getting the strongest pull.',
  },
  official: {
    title: 'Official Feed',
    subtitle: 'Curated route posts promoted by the AntAPP team.',
    composer: 'Choose a curated route and publish an official update.',
    railTitle: 'Editorial watchlist',
    railSubtitle: 'Fresh official routes and posts to watch.',
  },
  community: {
    title: 'Community Feed',
    subtitle: 'Community route posts from users. Official promotions stay out of this lane.',
    composer: 'Choose a community route and publish a post.',
    railTitle: 'Community momentum',
    railSubtitle: 'Recent community routes and posts climbing fastest.',
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
      return { badge: 'Community', variant: 'default' as const, label: 'Community share' }
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
    role: 'Route creator',
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

function formatSocialCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function FeedPostCard({
  route,
  referenceNowMs,
  currentUserName,
}: {
  route: RouteListItem
  referenceNowMs: number
  currentUserName?: string | null
}) {
  const router = useRouter()
  const tone = getPostTone(route)
  const author = getAuthor(route)
  const media = route.postImageUrls?.length ? route.postImageUrls : (route.thumbnailUrl ? [route.thumbnailUrl] : [])
  const coverImage = media[0] ?? null
  const postId = route.postId ?? null
  const isInteractivePost = Boolean(postId)
  const feedLabel = isInteractivePost ? tone.label : 'Route preview'

  const [reactionCount, setReactionCount] = useState(route.postReactionCount ?? 0)
  const [commentCount, setCommentCount] = useState(route.postCommentCount ?? 0)
  const [shareCount, setShareCount] = useState(route.postShareCount ?? 0)
  const [isReacted, setIsReacted] = useState(route.isReactedByCurrentUser ?? false)
  const [isShared, setIsShared] = useState(route.isSharedByCurrentUser ?? false)

  const [comments, setComments] = useState<PostCommentItem[]>([])
  const [reactions, setReactions] = useState<PostReactionItem[]>([])
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isReactionsOpen, setIsReactionsOpen] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [reactionsLoaded, setReactionsLoaded] = useState(false)
  const [commentsPage, setCommentsPage] = useState(1)
  const [reactionsPage, setReactionsPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(false)
  const [hasMoreReactions, setHasMoreReactions] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [shareNotice, setShareNotice] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [socialError, setSocialError] = useState<string | null>(null)
  const shareCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isLiking, startLiking] = useTransition()
  const [isReactionLoading, startReactionLoading] = useTransition()
  const [isCommentLoading, startCommentLoading] = useTransition()
  const [isCommentPosting, startCommentPosting] = useTransition()
  const [isSharing, startSharing] = useTransition()

  useEffect(() => () => {
    if (shareCopiedTimerRef.current) {
      clearTimeout(shareCopiedTimerRef.current)
    }
  }, [])

  const openCreatePost = () => {
    const params = new URLSearchParams({
      routeId: route.id,
    })
    router.push(`/posts/create?${params.toString()}`)
  }

  const loadComments = (page = 1, append = false) => {
    if (!postId) return

    startCommentLoading(async () => {
      try {
        const response = await getPostComments(postId, page, COMMENTS_PAGE_SIZE)
        setComments((current) => {
          if (!append) return response.data

          const merged = [...current]
          const existing = new Set(current.map((comment) => comment.commentId))
          for (const item of response.data) {
            if (!existing.has(item.commentId)) {
              merged.push(item)
            }
          }
          return merged
        })
        setCommentsLoaded(true)
        setCommentsPage(page)
        setHasMoreComments(page * COMMENTS_PAGE_SIZE < response.totalRecords)
        setCommentCount((current) => Math.max(current, response.totalRecords))
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to load comments.')
      }
    })
  }

  const loadReactions = (page = 1, append = false) => {
    if (!postId) return

    startReactionLoading(async () => {
      try {
        const response = await getPostReactions(postId, page, REACTIONS_PAGE_SIZE)
        setReactions((current) => {
          if (!append) return response.data

          const merged = [...current]
          const existing = new Set(current.map((reaction) => reaction.reactionId))
          for (const item of response.data) {
            if (!existing.has(item.reactionId)) {
              merged.push(item)
            }
          }
          return merged
        })
        setReactionsLoaded(true)
        setReactionsPage(page)
        setHasMoreReactions(page * REACTIONS_PAGE_SIZE < response.totalRecords)
        setReactionCount((current) => Math.max(current, response.totalRecords))
        setShareNotice(null)
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to load likes.')
      }
    })
  }

  const handleToggleReaction = () => {
    if (!postId) {
      openCreatePost()
      return
    }
    if (isLiking) return

    startLiking(async () => {
      try {
        const result = await togglePostReaction(postId)
        setIsReacted(result.isReactedByCurrentUser)
        setReactionCount(result.reactionCount)
        setReactionsLoaded(false)
        setReactionsPage(1)
        setHasMoreReactions(false)
        if (isReactionsOpen) {
          loadReactions(1, false)
        }
        setShareNotice(null)
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
    if (nextOpen && !commentsLoaded) {
      loadComments(1, false)
    }
  }

  const handleToggleReactions = () => {
    if (!postId) {
      openCreatePost()
      return
    }

    const nextOpen = !isReactionsOpen
    setIsReactionsOpen(nextOpen)
    if (nextOpen && !reactionsLoaded) {
      loadReactions(1, false)
    }
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
        setCommentsPage(1)
        setHasMoreComments(false)
        setShareNotice(null)
        if (isCommentsOpen) {
          loadComments(1, false)
        }
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to post comment.')
      }
    })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!postId || isCommentPosting) return
    if (!window.confirm('Delete this comment?')) return

    startCommentPosting(async () => {
      try {
        await deletePostComment(postId, commentId)
        setComments(current => current.filter(c => c.commentId !== commentId))
        setCommentCount(c => Math.max(0, c - 1))
        setShareNotice(null)
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to delete comment.')
      }
    })
  }

  const handleShare = () => {
    if (!postId) {
      openCreatePost()
      return
    }
    if (isSharing || shareCopied) return

    startSharing(async () => {
      try {
        const result = await sharePost(postId)
        setIsShared(result.isSharedByCurrentUser)
        setShareCount(result.shareCount)
        let copied = false
        const routeLink = `${window.location.origin}/routes/${route.id}`
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(routeLink)
            copied = true
          } catch {
          }
        }
        setShareCopied(true)
        setShareNotice(copied ? null : 'Link share saved.')
        if (shareCopiedTimerRef.current) {
          clearTimeout(shareCopiedTimerRef.current)
        }
        shareCopiedTimerRef.current = setTimeout(() => {
          setShareCopied(false)
          shareCopiedTimerRef.current = null
        }, 2500)
        setSocialError(null)
      } catch (e) {
        setShareNotice(null)
        setSocialError((e as Error).message ?? 'Failed to share post.')
      }
    })
  }

  const handleLoadMoreComments = () => {
    if (!postId || isCommentLoading || !hasMoreComments) return
    loadComments(commentsPage + 1, true)
  }

  const handleLoadMoreReactions = () => {
    if (!postId || isReactionLoading || !hasMoreReactions) return
    loadReactions(reactionsPage + 1, true)
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
          <Link href={`/profiles/${route.authorUserId}`} style={{ textDecoration: 'none' }}>
            <Avatar size="lg" initials={author.initials} />
          </Link>
          <YStack gap="$1.5" flex={1}>
            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Link href={`/profiles/${route.authorUserId}`} style={{ textDecoration: 'none' }}>
                <Text variant="label" hoverStyle={{ color: '$primary' }}>{author.name}</Text>
              </Link>
              <Badge variant={tone.variant} size="sm">{tone.badge}</Badge>
            </XStack>
            <Text variant="caption" muted>{author.role}</Text>
            <XStack gap="$2" flexWrap="wrap" alignItems="center">
              <Text variant="caption" muted>{formatRelativeDate(route.createdAt, referenceNowMs)}</Text>
              <CircleDot size={10} color="var(--color-mutedForeground)" />
              <Text variant="caption" muted>{feedLabel}</Text>
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
              <Text variant="label" color="$primary">{isInteractivePost ? 'Post details' : 'Route preview'}</Text>
              <Text variant="body" muted>
                {isInteractivePost
                  ? `Shared on ${formatFullDate(route.createdAt)}. People can like, comment, and copy this route link.`
                  : `Published ${formatFullDate(route.createdAt)}. Publish this route as a post to turn on likes, comments, and link copies.`}
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

            <Button
              variant="outline"
              size="sm"
              icon={<Compass size={14} color="currentColor" />}
              onPress={() => router.push(`/routes/${route.id}`)}
            >
              Open route
            </Button>
          </YStack>
        </XStack>
      </YStack>

      {isInteractivePost && (
        <>
          <XStack justifyContent="space-between" gap="$2" flexWrap="wrap">
            <XStack
              cursor="pointer"
              onPress={handleToggleReactions}
              paddingVertical="$1"
              paddingHorizontal="$2"
              borderRadius="$2"
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
            >
              <Text variant="caption" color={isReactionsOpen ? '$primary' : '$mutedForeground'}>
                {formatSocialCount(reactionCount, 'like', 'likes')}
              </Text>
            </XStack>
            <XStack
              cursor="pointer"
              onPress={handleToggleComments}
              paddingVertical="$1"
              paddingHorizontal="$2"
              borderRadius="$2"
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
            >
              <Text variant="caption" color={isCommentsOpen ? '$primary' : '$mutedForeground'}>
                {formatSocialCount(commentCount, 'comment', 'comments')}
              </Text>
            </XStack>
            <Text variant="caption" muted paddingVertical="$1" paddingHorizontal="$2">
              {formatSocialCount(shareCount, 'copy', 'copies')}
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
            <Button variant={isReacted ? 'solid' : 'ghost'} size="sm" disabled={isLiking} loading={isLiking} icon={<ThumbsUp size={16} color="currentColor" />} onPress={handleToggleReaction}>
              Like {reactionCount > 0 ? `(${reactionCount})` : ''}
            </Button>
            <Button variant={isCommentsOpen ? 'outline' : 'ghost'} size="sm" icon={<MessageCircle size={16} color="currentColor" />} onPress={handleToggleComments}>
              Comment {commentCount > 0 ? `(${commentCount})` : ''}
            </Button>
            <Button variant="ghost" size="sm" disabled={isSharing || shareCopied} loading={isSharing} icon={<Copy size={16} color="currentColor" />} onPress={handleShare}>
              {shareCopied ? 'Link copied' : 'Copy link'}
            </Button>
          </XStack>

          {shareNotice ? (
            <YStack backgroundColor="$success50" borderRadius="$3" padding="$3" borderWidth={1} borderColor="$success200">
              <Text variant="caption" color="$success500">{shareNotice}</Text>
            </YStack>
          ) : null}
        </>
      )}

      {!isInteractivePost ? (
        <YStack gap="$2">
          <Text variant="caption" muted>
            Publish this route as a post to enable likes, comments, and link copies.
          </Text>
          <Button variant="outline" size="sm" onPress={openCreatePost}>
            Publish as post
          </Button>
        </YStack>
      ) : null}

      {isReactionsOpen ? (
        <YStack gap="$3" borderTopWidth={1} borderTopColor="$borderColor" paddingTop="$3">
          <XStack justifyContent="space-between" alignItems="center" gap="$3">
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
                  <YStack gap="$0.5" flex={1}>
                    <Text variant="label">{reaction.userName?.trim() || 'Route Explorer'}</Text>
                    <Text variant="caption" muted>{formatRelativeDate(reaction.createdAt, referenceNowMs)}</Text>
                  </YStack>
                </XStack>
              ))}

              {hasMoreReactions ? (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isReactionLoading}
                  disabled={isReactionLoading}
                  onPress={handleLoadMoreReactions}
                >
                  Load more likes
                </Button>
              ) : null}
            </YStack>
          )}
        </YStack>
      ) : null}

      {isCommentsOpen ? (
        <YStack gap="$3" borderTopWidth={1} borderTopColor="$borderColor" paddingTop="$3">
          <XStack justifyContent="space-between" alignItems="center" gap="$3">
            <Text variant="label">Comments</Text>
            <Text variant="caption" muted>{formatSocialCount(commentCount, 'comment', 'comments')}</Text>
          </XStack>

          <XStack gap="$2">
            <Input
              value={commentDraft}
              onChangeText={setCommentDraft}
              variant="outline"
              size="md"
              placeholder="Write a comment..."
              flex={1}
            />
            <Button
              variant="solid"
              size="sm"
              disabled={!postId || isCommentPosting}
              loading={isCommentPosting}
              onPress={handleAddComment}
            >
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
                  <YStack gap="$1" flex={1}>
                    <XStack gap="$2" alignItems="center" flexWrap="wrap">
                      <Text variant="label">{comment.userName?.trim() || 'Route Explorer'}</Text>
                      <Text variant="caption" muted>{formatRelativeDate(comment.createdAt, referenceNowMs)}</Text>
                    </XStack>
                    {currentUserName && comment.userName === currentUserName && (
                      <Button
                        variant="ghost"
                        size="sm"
                        padding="$1"
                        height="auto"
                        onPress={() => handleDeleteComment(comment.commentId)}
                        disabled={isCommentPosting}
                      >
                        <Trash2 size={14} color="var(--color-mutedForeground)" />
                      </Button>
                    )}
                    <Text variant="body">{comment.content}</Text>
                  </YStack>
                </XStack>
              ))}

              {hasMoreComments ? (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isCommentLoading}
                  disabled={isCommentLoading}
                  onPress={handleLoadMoreComments}
                >
                  Load more comments
                </Button>
              ) : null}
            </YStack>
          )}
        </YStack>
      ) : null}

      {socialError ? (
        <Text variant="caption" color="$error500">{socialError}</Text>
      ) : null}
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
  const router = useRouter()
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
          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <Avatar size="lg" initials={composerInitials} />
            <XStack
              flex={1}
              minWidth={220}
              flexDirection="column"
              gap="$1"
            >
              <Text variant="label">Create a route post</Text>
              <Text variant="caption" muted>{copy.composer}</Text>
            </XStack>
            <Button
              variant="solid"
              size="sm"
              icon={<Plus size={14} color="#FFFFFF" />}
              onPress={() => router.push('/posts/create')}
            >
              Create post
            </Button>
          </XStack>
        </Card>

        <YStack gap="$4">
          {timelineRoutes.length > 0 ? (
            timelineRoutes.map((route) => (
              <FeedPostCard key={`${route.postId ?? route.id}-${route.createdAt}`} route={route} referenceNowMs={referenceNowMs} currentUserName={currentUserName} />
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
        <RightRailCard title="Live activity" subtitle="Where users are pinging right now">
          <MiniHeatmap />
        </RightRailCard>

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

        <RightRailCard title="Today in feed" subtitle="What is actually visible in this feed right now">
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="caption" muted>Real posts</Text>
              <Text variant="label">{timelineRoutes.filter((route) => route.postId).length}</Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text variant="caption" muted>Route previews</Text>
              <Text variant="label">{timelineRoutes.filter((route) => !route.postId).length}</Text>
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

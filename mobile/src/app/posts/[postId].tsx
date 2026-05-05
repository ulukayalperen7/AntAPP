import React, { useEffect, useState, useTransition } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Avatar, Badge, Button, Image, Input, ScrollView, Text, XStack, YStack } from '@antapp/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Share } from 'react-native'
import { useAuth } from '@/features/auth/context'
import {
  addPostComment,
  deletePostComment,
  getPostById,
  getPostComments,
  getPostReactions,
  sharePost,
  togglePostReaction,
  updatePost,
  updatePostComment,
} from '@/features/posts/api'
import type { FeedPostItem, PostCommentItem, PostReactionItem } from '@/features/api/types'

const COMMENTS_PAGE_SIZE = 20

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

export default function PostDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { postId } = useLocalSearchParams<{ postId: string }>()

  const [post, setPost] = useState<FeedPostItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Social state (initialised after post loads)
  const [reactionCount, setReactionCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [isReacted, setIsReacted] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [shareNotice, setShareNotice] = useState<string | null>(null)
  const [socialError, setSocialError] = useState<string | null>(null)

  // Comments state
  const [comments, setComments] = useState<PostCommentItem[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [hasMoreComments, setHasMoreComments] = useState(false)
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentDraft, setCommentDraft] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  // Reactions
  const [reactions, setReactions] = useState<PostReactionItem[]>([])
  const [isReactionsOpen, setIsReactionsOpen] = useState(false)
  const [reactionsLoaded, setReactionsLoaded] = useState(false)

  // Edit post state
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])
  const [displayContent, setDisplayContent] = useState<string | null>(null)
  const [displayImageUrls, setDisplayImageUrls] = useState<string[]>([])

  const [isLiking, startLiking] = useTransition()
  const [isSharing, startSharing] = useTransition()
  const [isCommentLoading, startCommentLoading] = useTransition()
  const [isCommentPosting, startCommentPosting] = useTransition()
  const [isReactionLoading, startReactionLoading] = useTransition()
  const [isSavingPost, startSavingPost] = useTransition()

  useEffect(() => {
    if (!postId) return
    let mounted = true
    setLoading(true)
    getPostById(postId)
      .then((data) => {
        if (!mounted) return
        setPost(data)
        setReactionCount(data.reactionCount)
        setCommentCount(data.commentCount)
        setShareCount(data.shareCount)
        setIsReacted(data.isReactedByCurrentUser)
        setIsShared(data.isSharedByCurrentUser)
        setDisplayContent(data.content)
        setDisplayImageUrls(data.imageUrls)
        setEditContent(data.content ?? '')
        setEditImageUrls(data.imageUrls)
        setLoading(false)
      })
      .catch((e) => {
        if (!mounted) return
        setLoadError((e as Error).message ?? 'Failed to load post.')
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [postId])

  if (loading) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text variant="body" muted>Loading post...</Text>
      </YStack>
    )
  }

  if (loadError || !post) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" gap="$3">
        <Text variant="body" muted>{loadError ?? 'Post not found.'}</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>Go back</Button>
      </YStack>
    )
  }

  const isOwnPost = Boolean(user?.userName && user.userName === post.authorUserName)
  const coverImage = displayImageUrls?.[0] ?? post.routeThumbnailUrl ?? null
  const authorInitials = getInitials(post.authorUserName)

  const loadComments = (page = 1, append = false) => {
    startCommentLoading(async () => {
      try {
        const response = await getPostComments(post.postId, page, COMMENTS_PAGE_SIZE)
        setComments((current) => {
          if (!append) return response.data
          const merged = [...current]
          const existing = new Set(current.map((c) => c.commentId))
          for (const item of response.data) {
            if (!existing.has(item.commentId)) merged.push(item)
          }
          return merged
        })
        setCommentsLoaded(true)
        setCommentsPage(page)
        setHasMoreComments(page * COMMENTS_PAGE_SIZE < response.totalRecords)
        setCommentCount((cur) => Math.max(cur, response.totalRecords))
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to load comments.')
      }
    })
  }

  const loadReactions = () => {
    startReactionLoading(async () => {
      try {
        const response = await getPostReactions(post.postId, 1, 20)
        setReactions(response.data)
        setReactionsLoaded(true)
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to load likes.')
      }
    })
  }

  const handleToggleReaction = () => {
    if (isLiking) return
    startLiking(async () => {
      try {
        const result = await togglePostReaction(post.postId)
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

  const handleToggleReactions = () => {
    const nextOpen = !isReactionsOpen
    setIsReactionsOpen(nextOpen)
    if (nextOpen && !reactionsLoaded) loadReactions()
  }

  const handleShare = () => {
    if (isSharing) return
    startSharing(async () => {
      try {
        const result = await sharePost(post.postId)
        setIsShared(result.isSharedByCurrentUser)
        setShareCount(result.shareCount)
        await Share.share({
          title: post.routeTitle,
          message: `Check out this post: ${post.routeTitle}`,
        })
        setShareNotice('Share saved.')
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to share post.')
      }
    })
  }

  const handleAddComment = () => {
    if (isCommentPosting) return
    const content = commentDraft.trim()
    if (!content) {
      setSocialError('Comment cannot be empty.')
      return
    }
    startCommentPosting(async () => {
      try {
        const result = await addPostComment(post.postId, content)
        setCommentCount(result.commentCount)
        setCommentDraft('')
        setCommentsLoaded(false)
        loadComments(1, false)
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to post comment.')
      }
    })
  }

  const handleDeleteComment = (commentId: string) => {
    if (isCommentPosting) return
    startCommentPosting(async () => {
      try {
        await deletePostComment(post.postId, commentId)
        setComments((current) => current.filter((c) => c.commentId !== commentId))
        setCommentCount((c) => Math.max(0, c - 1))
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
    if (isCommentPosting) return
    const content = editDraft.trim()
    if (!content) return
    startCommentPosting(async () => {
      try {
        await updatePostComment(post.postId, commentId, content)
        setComments((current) =>
          current.map((c) => (c.commentId === commentId ? { ...c, content } : c))
        )
        setEditingCommentId(null)
        setEditDraft('')
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to update comment.')
      }
    })
  }

  const handleSavePost = () => {
    if (isSavingPost) return
    startSavingPost(async () => {
      try {
        await updatePost(post.postId, {
          content: editContent,
          imageUrls: editImageUrls.filter((u) => u.trim()),
        })
        setDisplayContent(editContent)
        setDisplayImageUrls(editImageUrls.filter((u) => u.trim()))
        setIsEditing(false)
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to update post.')
      }
    })
  }

  const handleCancelPostEdit = () => {
    setEditContent(displayContent ?? '')
    setEditImageUrls(displayImageUrls)
    setIsEditing(false)
    setSocialError(null)
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingTop={insets.top} paddingBottom={100}>
          {/* Header: back + title */}
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$3"
            alignItems="center"
            gap="$3"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <XStack onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} color="currentColor" />
            </XStack>
            <Text variant="label" flex={1}>Post</Text>
            {isOwnPost && !isEditing ? (
              <Button variant="outline" size="sm" onPress={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : null}
            <XStack onPress={() => router.push(`/routes/${post.routeId}`)}>
              <Feather name="compass" size={22} color="currentColor" />
            </XStack>
          </XStack>

          {/* Author row */}
          <XStack
            gap="$2.5"
            alignItems="center"
            paddingHorizontal="$3"
            paddingVertical="$2.5"
          >
            <XStack onPress={() => router.push(`/profiles/${post.authorUserId}`)}>
              <Avatar size="sm" initials={authorInitials} />
            </XStack>
            <XStack
              flex={1}
              gap="$2"
              alignItems="center"
              onPress={() => router.push(`/profiles/${post.authorUserId}`)}
            >
              <Text variant="label">{post.authorUserName ?? 'Route Explorer'}</Text>
            </XStack>
          </XStack>

          {/* Edit form */}
          {isEditing ? (
            <YStack
              paddingHorizontal="$3"
              paddingBottom="$3"
              gap="$3"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <Input
                value={editContent}
                onChangeText={setEditContent}
                variant="outline"
                placeholder="Write a caption..."
                multiline
                numberOfLines={4}
              />
              <YStack gap="$2">
                <Text variant="caption" muted>Image URLs</Text>
                {editImageUrls.map((url, idx) => (
                  <XStack key={idx} gap="$2" alignItems="center">
                    <Input
                      value={url}
                      onChangeText={(val: string) => {
                        setEditImageUrls((prev) => prev.map((u, i) => (i === idx ? val : u)))
                      }}
                      variant="outline"
                      placeholder={`Image URL ${idx + 1}`}
                      flex={1}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() =>
                        setEditImageUrls((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      Remove
                    </Button>
                  </XStack>
                ))}
                {editImageUrls.length < 8 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setEditImageUrls((prev) => [...prev, ''])}
                  >
                    Add image URL
                  </Button>
                ) : null}
              </YStack>
              <XStack gap="$2">
                <Button
                  variant="solid"
                  size="sm"
                  loading={isSavingPost}
                  disabled={isSavingPost}
                  onPress={handleSavePost}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isSavingPost}
                  onPress={handleCancelPostEdit}
                >
                  Cancel
                </Button>
              </XStack>
            </YStack>
          ) : null}

          {/* Cover image */}
          <YStack
            width="100%"
            height={400}
            backgroundColor="$muted"
            overflow="hidden"
          >
            {coverImage ? (
              <Image src={coverImage} width="100%" height="100%" objectFit="cover" />
            ) : (
              <YStack flex={1} alignItems="center" justifyContent="center">
                <Feather name="compass" size={36} color="currentColor" />
              </YStack>
            )}
          </YStack>

          {/* Action icons */}
          <XStack
            paddingHorizontal="$3"
            paddingTop="$3"
            paddingBottom="$1"
            justifyContent="space-between"
            alignItems="center"
          >
            <XStack gap="$4" alignItems="center">
              <XStack onPress={handleToggleReaction} opacity={isLiking ? 0.4 : 1}>
                <Feather
                  name="thumbs-up"
                  size={22}
                  color={isReacted ? 'var(--color-primary)' : 'currentColor'}
                />
              </XStack>
              <XStack onPress={() => { if (!commentsLoaded) loadComments(1, false) }}>
                <Feather name="message-circle" size={22} color="currentColor" />
              </XStack>
              <XStack onPress={handleShare} opacity={isSharing ? 0.4 : 1}>
                <Feather name="share-2" size={22} color="currentColor" />
              </XStack>
            </XStack>
            <XStack onPress={() => router.push(`/routes/${post.routeId}`)}>
              <Feather name="compass" size={22} color="currentColor" />
            </XStack>
          </XStack>

          {/* Like count */}
          {reactionCount > 0 ? (
            <XStack paddingHorizontal="$3" paddingTop="$1" onPress={handleToggleReactions}>
              <Text variant="label">
                {reactionCount} {reactionCount === 1 ? 'like' : 'likes'}
              </Text>
            </XStack>
          ) : null}

          {/* Caption */}
          <XStack
            paddingHorizontal="$3"
            paddingTop="$1.5"
            paddingBottom="$0.5"
            flexWrap="wrap"
            gap="$1.5"
            alignItems="flex-start"
          >
            <Text variant="label">{post.routeTitle}</Text>
            {displayContent?.trim() ? (
              <Text variant="body" color="$color">{displayContent.trim()}</Text>
            ) : null}
          </XStack>

          {/* Timestamp */}
          <Text variant="caption" muted paddingHorizontal="$3" paddingTop="$1" paddingBottom="$3">
            {formatRelativeDate(post.createdAt)}
          </Text>

          {/* Notices */}
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

          {/* Reactions panel */}
          {isReactionsOpen ? (
            <YStack
              gap="$3"
              borderTopWidth={1}
              borderTopColor="$borderColor"
              paddingHorizontal="$3"
              paddingTop="$3"
              paddingBottom="$3"
            >
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

          {/* Comments section — always visible, auto-loads */}
          <YStack
            gap="$3"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            paddingHorizontal="$3"
            paddingTop="$3"
            paddingBottom="$3"
          >
            {/* Comment input */}
            <XStack gap="$2">
              <Input
                value={commentDraft}
                onChangeText={setCommentDraft}
                variant="outline"
                placeholder="Add a comment..."
                flex={1}
              />
              <Button
                variant="solid"
                size="sm"
                loading={isCommentPosting}
                disabled={isCommentPosting || !commentDraft.trim()}
                onPress={handleAddComment}
              >
                Post
              </Button>
            </XStack>

            {/* Load comments */}
            {!commentsLoaded ? (
              <Button
                variant="outline"
                size="sm"
                loading={isCommentLoading}
                disabled={isCommentLoading}
                onPress={() => loadComments(1, false)}
              >
                {isCommentLoading
                  ? 'Loading comments...'
                  : `View ${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
              </Button>
            ) : null}

            {/* Comments list */}
            {commentsLoaded ? (
              <YStack gap="$2.5">
                {comments.length === 0 ? (
                  <Text variant="caption" muted>No comments yet. Be the first!</Text>
                ) : (
                  comments.map((comment) => {
                    const isOwn = Boolean(user?.userName && comment.userName === user.userName)
                    const isEditingThis = editingCommentId === comment.commentId
                    return (
                      <XStack key={comment.commentId} gap="$2" alignItems="flex-start">
                        <Avatar size="sm" initials={getInitials(comment.userName)} />
                        <YStack flex={1} gap="$0.5">
                          <XStack gap="$1.5" alignItems="center" flexWrap="wrap">
                            <Text variant="label">{comment.userName?.trim() || 'Route Explorer'}</Text>
                            <Text variant="caption" muted>{formatRelativeDate(comment.createdAt)}</Text>
                            {isOwn && !isEditingThis ? (
                              <>
                                <Text
                                  variant="caption"
                                  muted
                                  onPress={() => handleStartEdit(comment)}
                                >
                                  Düzenle
                                </Text>
                                <Text
                                  variant="caption"
                                  muted
                                  onPress={() => handleDeleteComment(comment.commentId)}
                                >
                                  Sil
                                </Text>
                              </>
                            ) : null}
                          </XStack>
                          {isEditingThis ? (
                            <YStack gap="$2">
                              <Input
                                value={editDraft}
                                onChangeText={setEditDraft}
                                variant="outline"
                                placeholder="Edit comment..."
                              />
                              <XStack gap="$2">
                                <Button
                                  variant="solid"
                                  size="sm"
                                  loading={isCommentPosting}
                                  disabled={isCommentPosting}
                                  onPress={() => handleSaveEdit(comment.commentId)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isCommentPosting}
                                  onPress={handleCancelEdit}
                                >
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
                  })
                )}
                {hasMoreComments ? (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={isCommentLoading}
                    disabled={isCommentLoading}
                    onPress={() => loadComments(commentsPage + 1, true)}
                  >
                    Load more comments
                  </Button>
                ) : null}
              </YStack>
            ) : null}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}

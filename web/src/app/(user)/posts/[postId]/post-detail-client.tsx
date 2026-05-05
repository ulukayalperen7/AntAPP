'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Avatar, Badge, Button, Image, Input, Text, XStack, YStack } from '@antapp/ui'
import {
  addPostComment,
  deletePostComment,
  getPostComments,
  getPostReactions,
  sharePost,
  togglePostReaction,
  updatePost,
  updatePostComment,
} from '@/features/posts/actions'
import type { FeedPostItem, PostCommentItem, PostReactionItem } from '@/types/api'
import { ThumbsUp, MessageCircle, Copy, Compass } from 'lucide-react'

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
  const hasTimezone = /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value)
  const normalized = hasTimezone ? value : `${value}Z`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return 'Now'
  const diffMinutes = Math.round((Date.now() - date.getTime()) / (1000 * 60))
  if (diffMinutes <= 1) return 'Now'
  if (diffMinutes < 60) return `${diffMinutes}m`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date)
}

type Props = {
  post: FeedPostItem
  currentUserName: string | null
}

export default function PostDetailClient({ post, currentUserName }: Props) {
  const router = useRouter()

  // Social state
  const [reactionCount, setReactionCount] = useState(post.reactionCount)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [shareCount, setShareCount] = useState(post.shareCount)
  const [isReacted, setIsReacted] = useState(post.isReactedByCurrentUser)
  const [isShared, setIsShared] = useState(post.isSharedByCurrentUser)
  const [shareCopied, setShareCopied] = useState(false)
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

  // Edit post state
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [editImageUrls, setEditImageUrls] = useState<string[]>(post.imageUrls)
  const [postContent, setPostContent] = useState(post.content)
  const [postImageUrls, setPostImageUrls] = useState<string[]>(post.imageUrls)

  // Reactions
  const [reactions, setReactions] = useState<PostReactionItem[]>([])
  const [isReactionsOpen, setIsReactionsOpen] = useState(false)
  const [reactionsLoaded, setReactionsLoaded] = useState(false)

  const [isLiking, startLiking] = useTransition()
  const [isSharing, startSharing] = useTransition()
  const [isCommentLoading, startCommentLoading] = useTransition()
  const [isCommentPosting, startCommentPosting] = useTransition()
  const [isReactionLoading, startReactionLoading] = useTransition()
  const [isSavingPost, startSavingPost] = useTransition()

  const isOwnPost = Boolean(currentUserName && currentUserName === post.authorUserName)
  const coverImage = postImageUrls?.[0] ?? post.routeThumbnailUrl ?? null
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
    if (isSharing || shareCopied) return
    startSharing(async () => {
      try {
        const result = await sharePost(post.postId)
        setIsShared(result.isSharedByCurrentUser)
        setShareCount(result.shareCount)
        const postLink = `${window.location.origin}/posts/${post.postId}`
        let copied = false
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(postLink)
            copied = true
          } catch {}
        }
        setShareCopied(true)
        setShareNotice(copied ? null : 'Link share saved.')
        setTimeout(() => setShareCopied(false), 2500)
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
    if (!window.confirm('Delete this comment?')) return
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
        setPostContent(editContent)
        setPostImageUrls(editImageUrls.filter((u) => u.trim()))
        setIsEditing(false)
        setSocialError(null)
      } catch (e) {
        setSocialError((e as Error).message ?? 'Failed to update post.')
      }
    })
  }

  const handleCancelPostEdit = () => {
    setEditContent(postContent ?? '')
    setEditImageUrls(postImageUrls)
    setIsEditing(false)
    setSocialError(null)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Author row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-borderColor)',
        }}
      >
        <Link href={`/profiles/${post.authorUserId}`} style={{ textDecoration: 'none' }}>
          <Avatar size="sm" initials={authorInitials} />
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Link href={`/profiles/${post.authorUserId}`} style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--color-color)',
              }}
            >
              {post.authorUserName ?? 'Route Explorer'}
            </span>
          </Link>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-mutedForeground)' }}>
            {post.routeContentType ?? 'Community'}
          </span>
        </div>
        {isOwnPost && !isEditing ? (
          <Button variant="outline" size="sm" onPress={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onPress={() => router.push(`/routes/${post.routeId}`)}>
          <Compass size={16} color="currentColor" />
        </Button>
      </div>

      {/* Edit form */}
      {isEditing ? (
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--color-borderColor)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Input
            value={editContent}
            onChangeText={setEditContent}
            variant="outline"
            placeholder="Write a caption..."
            multiline
            numberOfLines={4}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-mutedForeground)' }}>
              Image URLs (one per field)
            </span>
            {editImageUrls.map((url, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8 }}>
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
              </div>
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
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
          </div>
        </div>
      ) : null}

      {/* Cover image */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: 'var(--color-muted)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {coverImage ? (
          <Image src={coverImage} width="100%" height="100%" objectFit="cover" />
        ) : (
          <div
            style={{
              display: 'flex',
              flex: 1,
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={48} color="var(--color-mutedForeground)" />
          </div>
        )}
      </div>

      {/* Action icons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px 4px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <div
            onClick={handleToggleReaction}
            style={{ cursor: 'pointer', opacity: isLiking ? 0.4 : 1 }}
          >
            <ThumbsUp
              size={22}
              color={isReacted ? 'var(--color-primary)' : 'currentColor'}
              fill={isReacted ? 'var(--color-primary)' : 'none'}
            />
          </div>
          <div
            onClick={() => {
              if (!commentsLoaded) loadComments(1, false)
            }}
            style={{ cursor: 'pointer', opacity: 0.8 }}
          >
            <MessageCircle size={22} color="currentColor" />
          </div>
          <div
            onClick={handleShare}
            style={{ cursor: 'pointer', opacity: isSharing ? 0.4 : 1 }}
          >
            <Copy size={22} color={shareCopied ? 'var(--color-primary)' : 'currentColor'} />
          </div>
        </div>
        <div
          onClick={() => router.push(`/routes/${post.routeId}`)}
          style={{ cursor: 'pointer', opacity: 0.8 }}
        >
          <Compass size={22} color="currentColor" />
        </div>
      </div>

      {/* Like count */}
      {reactionCount > 0 ? (
        <div
          onClick={handleToggleReactions}
          style={{ padding: '4px 16px', cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {reactionCount} {reactionCount === 1 ? 'like' : 'likes'}
          </span>
        </div>
      ) : null}

      {/* Caption */}
      <div style={{ padding: '4px 16px 2px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{post.routeTitle}</span>
        {postContent?.trim() ? (
          <span style={{ fontSize: '0.875rem', color: 'var(--color-color)' }}>
            {postContent.trim()}
          </span>
        ) : null}
      </div>

      {/* Timestamp */}
      <div style={{ padding: '2px 16px 8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-mutedForeground)' }}>
          {formatRelativeDate(post.createdAt)}
        </span>
      </div>

      {/* Notices */}
      {shareNotice ? (
        <div style={{ padding: '4px 16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-success500)' }}>
            {shareNotice}
          </span>
        </div>
      ) : null}
      {socialError ? (
        <div style={{ padding: '4px 16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-error500)' }}>
            {socialError}
          </span>
        </div>
      ) : null}

      {/* Reactions panel */}
      {isReactionsOpen ? (
        <div
          style={{
            borderTop: '1px solid var(--color-borderColor)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {isReactionLoading ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-mutedForeground)' }}>
              Loading likes...
            </span>
          ) : reactions.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-mutedForeground)' }}>
              No likes yet.
            </span>
          ) : (
            reactions.map((r) => (
              <div key={r.reactionId} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar size="sm" initials={getInitials(r.userName)} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {r.userName?.trim() || 'Route Explorer'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-mutedForeground)' }}>
                    {formatRelativeDate(r.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* Comments section — always open on detail page */}
      <div
        style={{
          borderTop: '1px solid var(--color-borderColor)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Comment input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            value={commentDraft}
            onChangeText={setCommentDraft}
            variant="outline"
            size="md"
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
        </div>

        {/* Load comments button if not loaded */}
        {!commentsLoaded ? (
          <Button
            variant="outline"
            size="sm"
            loading={isCommentLoading}
            disabled={isCommentLoading}
            onPress={() => loadComments(1, false)}
          >
            {isCommentLoading ? 'Loading comments...' : `View ${commentCount} comments`}
          </Button>
        ) : null}

        {/* Comments list */}
        {commentsLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {comments.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-mutedForeground)' }}>
                No comments yet. Be the first!
              </span>
            ) : (
              comments.map((comment) => {
                const isOwn = Boolean(currentUserName && comment.userName === currentUserName)
                const isEditingThis = editingCommentId === comment.commentId
                return (
                  <div
                    key={comment.commentId}
                    style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
                  >
                    <Avatar size="sm" initials={getInitials(comment.userName)} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {comment.userName?.trim() || 'Route Explorer'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-mutedForeground)',
                          }}
                        >
                          {formatRelativeDate(comment.createdAt)}
                        </span>
                        {isOwn && !isEditingThis ? (
                          <>
                            <span
                              onClick={() => handleStartEdit(comment)}
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-mutedForeground)',
                                cursor: 'pointer',
                              }}
                            >
                              Düzenle
                            </span>
                            <span
                              onClick={() => handleDeleteComment(comment.commentId)}
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-mutedForeground)',
                                cursor: 'pointer',
                              }}
                            >
                              Sil
                            </span>
                          </>
                        ) : null}
                      </div>
                      {isEditingThis ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <Input
                            value={editDraft}
                            onChangeText={setEditDraft}
                            variant="outline"
                            size="md"
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
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
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem' }}>{comment.content}</span>
                      )}
                    </div>
                  </div>
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
          </div>
        ) : null}
      </div>
    </div>
  )
}

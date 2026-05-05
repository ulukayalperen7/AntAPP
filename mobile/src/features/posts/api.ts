import { apiFetchData, apiFetchPaged } from '@/features/api/client'
import type {
  FeedPostItem,
  PagedApiResponse,
  PostCommentCreateResult,
  PostCommentItem,
  PostReactionItem,
  PostReactionSummary,
  PostShareSummary,
} from '@/features/api/types'

export type FeedMode = 'timeline' | 'official' | 'community'

export async function getFeedPosts(
  mode: FeedMode,
  page = 1,
  pageSize = 12,
  authorId?: string,
): Promise<PagedApiResponse<FeedPostItem>> {
  const params = new URLSearchParams({
    mode,
    page: String(page),
    pageSize: String(pageSize),
  })
  if (authorId) params.set('authorId', authorId)

  return apiFetchPaged<FeedPostItem>(`/posts?${params.toString()}`)
}

export async function createPost(data: {
  routeId: string
  content?: string
  imageUrls?: string[]
}): Promise<string> {
  return apiFetchData<string>('/posts', {
    method: 'POST',
    body: JSON.stringify({
      routeId: data.routeId,
      content: data.content,
      imageUrls: data.imageUrls ?? [],
    }),
  })
}

export async function togglePostReaction(postId: string): Promise<PostReactionSummary> {
  return apiFetchData<PostReactionSummary>(`/posts/${postId}/reactions/toggle`, {
    method: 'POST',
  })
}

export async function getPostReactions(
  postId: string,
  page = 1,
  pageSize = 20,
): Promise<PagedApiResponse<PostReactionItem>> {
  return apiFetchPaged<PostReactionItem>(`/posts/${postId}/reactions?page=${page}&pageSize=${pageSize}`)
}

export async function getPostComments(
  postId: string,
  page = 1,
  pageSize = 20,
): Promise<PagedApiResponse<PostCommentItem>> {
  return apiFetchPaged<PostCommentItem>(`/posts/${postId}/comments?page=${page}&pageSize=${pageSize}`)
}

export async function addPostComment(postId: string, content: string): Promise<PostCommentCreateResult> {
  return apiFetchData<PostCommentCreateResult>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export async function updatePostComment(postId: string, commentId: string, content: string): Promise<void> {
  return apiFetchData<void>(`/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export async function deletePostComment(postId: string, commentId: string): Promise<void> {
  return apiFetchData<void>(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  })
}

export async function sharePost(postId: string): Promise<PostShareSummary> {
  return apiFetchData<PostShareSummary>(`/posts/${postId}/shares`, {
    method: 'POST',
  })
}

export async function getPostById(postId: string): Promise<FeedPostItem> {
  return apiFetchData<FeedPostItem>(`/posts/${postId}`)
}

export async function updatePost(
  postId: string,
  data: { content?: string; imageUrls?: string[] },
): Promise<void> {
  return apiFetchData<void>(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify({
      content: data.content ?? '',
      imageUrls: data.imageUrls ?? [],
    }),
  })
}

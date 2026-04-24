'use server'

import { apiFetchData, apiFetchPaged } from '@/lib/api'
import type {
  FeedPostItem,
  PagedApiResponse,
  PostCommentCreateResult,
  PostCommentItem,
  PostReactionSummary,
  PostShareSummary,
} from '@/types/api'

export type FeedMode = 'timeline' | 'official' | 'community'

export async function getFeedPosts(
  mode: FeedMode,
  page = 1,
  pageSize = 12
): Promise<PagedApiResponse<FeedPostItem>> {
  return apiFetchPaged<FeedPostItem>(`/posts?mode=${mode}&page=${page}&pageSize=${pageSize}`)
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

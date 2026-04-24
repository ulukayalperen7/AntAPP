'use server'

import { apiFetchData, apiFetchPaged } from '@/lib/api'
import type { FeedPostItem, PagedApiResponse } from '@/types/api'

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

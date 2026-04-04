import { apiFetchData, apiFetchPaged } from '@/features/api/client'
import type { PagedApiResponse, RouteDetail, RouteListItem, Tag } from '@/features/api/types'

export type GetRoutesParams = {
  search?: string
  tagIds?: string[]
  sort?: 'rating' | 'newest' | string
  type?: 'official' | 'community' | 'sponsored'
  visibility?: 'public' | 'private'
  authorId?: string
  page?: number
  pageSize?: number
}

export async function getRoutes(params: GetRoutesParams = {}): Promise<PagedApiResponse<RouteListItem>> {
  const qs = new URLSearchParams()

  if (params.search) qs.set('search', params.search)
  if (params.tagIds?.length) qs.set('tagIds', params.tagIds.join(','))
  if (params.sort) qs.set('sort', params.sort)
  if (params.type) qs.set('type', params.type)
  if (params.visibility) qs.set('visibility', params.visibility)
  if (params.authorId) qs.set('authorId', params.authorId)
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))

  const query = qs.toString()
  return apiFetchPaged<RouteListItem>(`/routes${query ? `?${query}` : ''}`)
}

export async function getRouteById(id: string): Promise<RouteDetail> {
  return apiFetchData<RouteDetail>(`/routes/${id}`)
}

export async function getTags(pageSize = 100): Promise<Tag[]> {
  const result = await apiFetchPaged<Tag>(`/tags?pageSize=${pageSize}`)
  return result.data
}

export async function rateRoute(routeId: string, score: number): Promise<void> {
  await apiFetchData<string>(`/routes/${routeId}/rating`, {
    method: 'PUT',
    body: JSON.stringify({ score }),
  })
}

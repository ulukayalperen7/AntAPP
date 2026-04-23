'use server'

import { apiFetchData, apiFetchPaged, publicApiFetchData, publicApiFetchPaged } from '@/lib/api'
import type { RouteListItem, RouteDetail, RouteStopItem, Tag, PagedApiResponse } from '@/types/api'

export type GetRoutesParams = {
  search?: string
  tagIds?: string[]
  sort?: 'rating' | 'newest' | string
  type?: 'official' | 'community' | 'sponsored'
  visibility?: 'public' | 'draft'
  authorId?: string
  page?: number
  pageSize?: number
}

function buildRoutesQuery(params: GetRoutesParams = {}) {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.tagIds?.length) qs.set('tagIds', params.tagIds.join(','))
  if (params.sort) qs.set('sort', params.sort)
  if (params.type) qs.set('type', params.type)
  if (params.visibility) qs.set('visibility', params.visibility)
  if (params.authorId) qs.set('authorId', params.authorId)
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  return qs.toString()
}

export async function getRoutes(params: GetRoutesParams = {}): Promise<PagedApiResponse<RouteListItem>> {
  const query = buildRoutesQuery(params)
  const path = `/routes${query ? `?${query}` : ''}`

  if (params.visibility === 'draft') {
    return apiFetchPaged<RouteListItem>(path)
  }

  return publicApiFetchPaged<RouteListItem>(path, { revalidate: 60 })
}

export async function getRouteById(id: string): Promise<RouteDetail> {
  return publicApiFetchData<RouteDetail>(`/routes/${id}`, { revalidate: 120 })
}

export async function getRouteStops(routeId: string): Promise<RouteStopItem[]> {
  return apiFetchData<RouteStopItem[]>(`/routes/${routeId}/stops`)
}

export async function addRouteStop(routeId: string, data: {
  spotId: string
  customTitle?: string
  customDescription?: string
  order?: number
}): Promise<string> {
  return apiFetchData<string>(`/routes/${routeId}/stops`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateRouteStop(routeId: string, routeStopId: string, data: {
  customTitle?: string
  customDescription?: string
  customPhotoUrl?: string
}): Promise<string> {
  return apiFetchData<string>(`/routes/${routeId}/stops/${routeStopId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteRouteStop(routeId: string, routeStopId: string): Promise<void> {
  await apiFetchData<string>(`/routes/${routeId}/stops/${routeStopId}`, {
    method: 'DELETE',
  })
}

export async function reorderRouteStops(routeId: string, orderedStopIds: string[]): Promise<void> {
  await apiFetchData<string>(`/routes/${routeId}/stops/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedStopIds }),
  })
}

export async function getTags(pageSize = 100): Promise<Tag[]> {
  const res = await publicApiFetchPaged<Tag>(`/tags?pageSize=${pageSize}`, { revalidate: 900 })
  return res.data
}

export async function getOwnRoutes(authorId: string, pageSize = 100): Promise<RouteListItem[]> {
  const [publicRoutes, draftRoutes] = await Promise.allSettled([
    getRoutes({ authorId, visibility: 'public', pageSize }),
    getRoutes({ authorId, visibility: 'draft', pageSize }),
  ])

  const items = [
    ...(publicRoutes.status === 'fulfilled' ? publicRoutes.value.data : []),
    ...(draftRoutes.status === 'fulfilled' ? draftRoutes.value.data : []),
  ]

  return items
    .filter((route, index, routes) => routes.findIndex((candidate) => candidate.id === route.id) === index)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

export async function createRoute(data: {
  title: string
  description?: string
  thumbnailUrl?: string
  tagIds?: string[]
  spots: Array<{ spotId: string; customTitle?: string; customDescription?: string }>
}): Promise<string> {
  return apiFetchData<string>('/routes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateRoute(id: string, data: {
  title?: string
  description?: string
  thumbnailUrl?: string
}): Promise<string> {
  return apiFetchData<string>(`/routes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteRoute(id: string): Promise<void> {
  await apiFetchData<string>(`/routes/${id}`, { method: 'DELETE' })
}

export async function publishRoute(id: string): Promise<void> {
  await apiFetchData<string>(`/routes/${id}/publish`, { method: 'POST' })
}

export async function unpublishRoute(id: string): Promise<void> {
  await apiFetchData<string>(`/routes/${id}/unpublish`, { method: 'POST' })
}

export async function forkRoute(id: string): Promise<string> {
  return apiFetchData<string>(`/routes/${id}/fork`, { method: 'POST' })
}

export async function rateRoute(routeId: string, score: number): Promise<void> {
  await apiFetchData<string>(`/routes/${routeId}/rating`, {
    method: 'PUT',
    body: JSON.stringify({ score }),
  })
}

export async function promoteRouteToOfficial(routeId: string): Promise<void> {
  await apiFetchData<string>(`/admin/routes/${routeId}/promote`, {
    method: 'POST',
  })
}

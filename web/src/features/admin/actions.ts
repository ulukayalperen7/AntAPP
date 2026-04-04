'use server'

import { apiFetch, apiFetchData, apiFetchPaged } from '@/lib/api'
import type { AdminCollection, AdminCollectionDetail, Tag, PagedApiResponse } from '@/types/api'

export async function getAdminCollections(page = 1, pageSize = 50): Promise<PagedApiResponse<AdminCollection>> {
  return apiFetchPaged<AdminCollection>(`/admin/collections?pageNumber=${page}&pageSize=${pageSize}`)
}

export async function getAdminCollectionById(id: string): Promise<AdminCollectionDetail> {
  return apiFetch<AdminCollectionDetail>(`/admin/collections/${id}`)
}

export async function updateAdminCollection(id: string, data: {
  name: string
  description?: string
  isPublic: boolean
  thumbnailUrl?: string
}): Promise<void> {
  await apiFetchData<string>(`/admin/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteAdminCollection(id: string): Promise<void> {
  await apiFetchData<string>(`/admin/collections/${id}`, {
    method: 'DELETE',
  })
}

export async function removeRouteFromAdminCollection(collectionId: string, routeId: string): Promise<void> {
  await apiFetchData<string>(`/admin/collections/${collectionId}/routes/${routeId}`, {
    method: 'DELETE',
  })
}

export async function getAdminTags(pageSize = 100): Promise<Tag[]> {
  const result = await apiFetchPaged<Tag>(`/v1/tags?pageSize=${pageSize}`)
  return result.data
}

export async function createAdminTag(name: string): Promise<string> {
  return apiFetch<string>('/v1/admin/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function deleteAdminTag(id: string): Promise<void> {
  await apiFetch<string>(`/v1/admin/tags/${id}`, {
    method: 'DELETE',
  })
}

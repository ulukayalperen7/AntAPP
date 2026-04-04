import { apiFetchData, apiFetchPaged } from '@/features/api/client'
import type { Collection, CollectionDetail } from '@/features/api/types'

export async function getCollections(page = 1, pageSize = 20) {
  return apiFetchPaged<Collection>(`/me/collections?pageNumber=${page}&pageSize=${pageSize}`)
}

export async function getCollectionById(id: string): Promise<CollectionDetail> {
  return apiFetchData<CollectionDetail>(`/me/collections/${id}`)
}

export async function createCollection(data: {
  name: string
  description?: string
  isPublic?: boolean
}): Promise<string> {
  return apiFetchData<string>('/me/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCollection(id: string, data: {
  name?: string
  description?: string
  isPublic?: boolean
  thumbnailUrl?: string
}): Promise<void> {
  await apiFetchData<string>(`/me/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCollection(id: string): Promise<void> {
  await apiFetchData<string>(`/me/collections/${id}`, {
    method: 'DELETE',
  })
}

export async function addRouteToCollection(collectionId: string, routeId: string): Promise<void> {
  await apiFetchData<string>(`/me/collections/${collectionId}/routes`, {
    method: 'POST',
    body: JSON.stringify({ routeId }),
  })
}

export async function removeRouteFromCollection(collectionId: string, routeId: string): Promise<void> {
  await apiFetchData<string>(`/me/collections/${collectionId}/routes/${routeId}`, {
    method: 'DELETE',
  })
}

export async function saveRoute(routeId: string): Promise<void> {
  await apiFetchData<string>('/me/saved-routes', {
    method: 'POST',
    body: JSON.stringify({ routeId }),
  })
}

export async function unsaveRoute(routeId: string): Promise<void> {
  await apiFetchData<string>(`/me/saved-routes/${routeId}`, {
    method: 'DELETE',
  })
}

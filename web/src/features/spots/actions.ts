'use server'

import { apiFetchData, apiFetchPaged } from '@/lib/api'
import type {
  BusinessSpotItem,
  PagedApiResponse,
  SpotDetail,
  SpotListItem,
  SpotRouteItem,
} from '@/types/api'

export async function getSpots(params: {
  search?: string
  page?: number
  pageSize?: number
} = {}): Promise<PagedApiResponse<SpotListItem>> {
  const qs = new URLSearchParams()

  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))

  const query = qs.toString()
  return apiFetchPaged<SpotListItem>(`/spots${query ? `?${query}` : ''}`)
}

export async function getSpotById(id: string): Promise<SpotDetail> {
  return apiFetchData<SpotDetail>(`/spots/${id}`)
}

export async function getSpotRoutes(spotId: string, page = 1, pageSize = 12): Promise<PagedApiResponse<SpotRouteItem>> {
  return apiFetchPaged<SpotRouteItem>(`/spots/${spotId}/routes?page=${page}&pageSize=${pageSize}`)
}

export async function rateSpot(spotId: string, score: number): Promise<void> {
  await apiFetchData<string>(`/spots/${spotId}/rating`, {
    method: 'PUT',
    body: JSON.stringify({ score }),
  })
}

export async function getBusinessSpots(page = 1, pageSize = 50): Promise<PagedApiResponse<BusinessSpotItem>> {
  return apiFetchPaged<BusinessSpotItem>(`/business/spots?page=${page}&pageSize=${pageSize}`)
}

export async function createBusinessSpot(data: {
  name: string
  description?: string
  photoUrl?: string
  latitude: number
  longitude: number
}): Promise<string> {
  return apiFetchData<string>('/business/spots', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBusinessSpot(id: string, data: {
  name?: string
  description?: string
  photoUrl?: string
  latitude?: number
  longitude?: number
}): Promise<string> {
  return apiFetchData<string>(`/business/spots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteBusinessSpot(id: string): Promise<void> {
  await apiFetchData<string>(`/business/spots/${id}`, {
    method: 'DELETE',
  })
}

export async function toggleSpotFavorite(spotId: string): Promise<boolean> {
  return apiFetchData<boolean>(`/spots/${spotId}/favorite`, {
    method: 'POST',
  })
}

export async function getSavedSpots(): Promise<SpotListItem[]> {
  const result = await apiFetchData<SpotListItem[]>('/spots/favorites')
  return result || []
}


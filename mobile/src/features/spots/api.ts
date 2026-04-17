import { apiFetchData, apiFetchPaged } from '@/features/api/client'
import type { PagedApiResponse, SpotDetail, SpotListItem, SpotRouteItem } from '@/features/api/types'

export type GetSpotsParams = {
  search?: string
  page?: number
  pageSize?: number
}

export async function getSpots(params: GetSpotsParams = {}): Promise<PagedApiResponse<SpotListItem>> {
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

export async function toggleSpotFavorite(spotId: string): Promise<boolean> {
  return apiFetchData<boolean>(`/spots/${spotId}/favorite`, {
    method: 'POST',
  })
}

export async function getSavedSpots(): Promise<SpotListItem[]> {
  const result = await apiFetchData<SpotListItem[]>('/spots/favorites')
  return result || []
}

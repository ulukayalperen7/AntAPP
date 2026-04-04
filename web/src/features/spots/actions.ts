'use server'

import { apiFetchData, apiFetchPaged } from '@/lib/api'
import type { BusinessSpotItem, PagedApiResponse } from '@/types/api'

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

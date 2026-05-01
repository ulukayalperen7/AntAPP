'use server'

import { apiFetch, apiFetchPaged } from '@/lib/api'
import { PagedApiResponse, RouteListItem } from '@/types/api'

export type RouteSpotDto = {
    spotId: string
    order: number
    name: string
    description: string
    photoUrl: string
    latitude: number
    longitude: number
    googlePlaceId: string
}

export type RouteDetailViewModel = {
    id: string
    title: string
    description: string
    thumbnailUrl: string
    authorUserId: string
    contentType: number
    isPublic: boolean
    encodedPolyline: string
    totalDistanceMeters: number
    estimatedDurationSeconds: number
    centerLatitude: number
    centerLongitude: number
    stops: RouteSpotDto[]
    averageRating: number
}

export async function getAdminRoutes(pageNumber = 1, pageSize = 50): Promise<PagedApiResponse<RouteListItem> | null> {
    try {
        return await apiFetchPaged<RouteListItem>(`/admin/routes?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function promoteRoute(id: string, contentType: 'Official' | 'Sponsored' | 'Community'): Promise<boolean> {
    try {
        await apiFetch(`/admin/routes/${id}/promote`, {
            method: 'PUT',
            body: JSON.stringify({ id, contentType }),
        })
        return true
    } catch {
        return false
    }
}

export async function deleteAdminRoute(id: string): Promise<boolean> {
    try {
        await apiFetch(`/admin/routes/${id}`, {
            method: 'DELETE',
        })
        return true
    } catch {
        return false
    }
}

export async function redrawRoute(id: string): Promise<boolean> {
    try {
        await apiFetch(`/routes/${id}/redraw`, {
            method: 'PUT',
        })
        return true
    } catch {
        return false
    }
}

export async function getRouteDetail(id: string): Promise<RouteDetailViewModel | null> {
    try {
        const res = await apiFetch<{ data: RouteDetailViewModel }>(`/routes/${id}`)
        return res.data
    } catch (e) {
        console.error('Failed to fetch route detail:', e)
        return null
    }
}

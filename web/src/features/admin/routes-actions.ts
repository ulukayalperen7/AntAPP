'use server'

import { apiFetch, apiFetchPaged } from '@/lib/api'
import { PagedApiResponse, RouteListItem } from '@/types/api'

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

'use server'

import { apiFetchPaged } from '@/lib/api'
import { PagedApiResponse } from '@/types/api'

export interface AdminSpotItem {
    id: string;
    name: string;
    description: string;
    photoUrl: string;
    latitude: number;
    longitude: number;
    routeCount: number;
    isActive: boolean;
    createdAt: string;
}

export async function getAdminSpots(pageNumber = 1, pageSize = 50): Promise<PagedApiResponse<AdminSpotItem> | null> {
    try {
        return await apiFetchPaged<AdminSpotItem>(`/admin/spots?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    } catch (error) {
        console.error(error)
        return null
    }
}

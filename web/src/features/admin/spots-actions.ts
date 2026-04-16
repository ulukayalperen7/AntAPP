'use server'

import { apiFetch, apiFetchPaged } from '@/lib/api'
import { PagedApiResponse } from '@/types/api'
import { revalidatePath } from 'next/cache'

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

export async function createSpot(data: Partial<AdminSpotItem>): Promise<boolean> {
    try {
        await apiFetch('/admin/spots', {
            method: 'POST',
            body: JSON.stringify(data),
        })
        revalidatePath('/admin/spots')
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function updateSpot(id: string, data: Partial<AdminSpotItem>): Promise<boolean> {
    try {
        await apiFetch(`/admin/spots/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...data, id }),
        })
        revalidatePath('/admin/spots')
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function deleteSpot(id: string): Promise<boolean> {
    try {
        await apiFetch(`/admin/spots/${id}`, {
            method: 'DELETE',
        })
        revalidatePath('/admin/spots')
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

'use server'

import { apiFetch, apiFetchPaged } from '@/lib/api'
import { PagedApiResponse } from '@/types/api'

export type AdminUserItem = {
    id: string
    userName: string
    email: string
    isVerified: boolean
    isActive: boolean
    roles: string[]
}

export async function getAdminUsers(pageNumber = 1, pageSize = 50): Promise<PagedApiResponse<AdminUserItem> | null> {
    try {
        return await apiFetchPaged<AdminUserItem>(`/admin/accounts?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
        await apiFetch(`/admin/accounts/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ userId, isActive }),
        })
        return true
    } catch {
        return false
    }
}

'use server'

import { apiFetchData } from '@/lib/api'

export type AdminStats = {
    totalRoutes: number
    activeUsers: number
    totalTags: number
    recentRoutes: {
        id: string
        title: string
        createdAt: string
    }[]
    topSpots: {
        id: string
        name: string
        averageRating: number
    }[]
}

export async function getAdminStats(): Promise<AdminStats | null> {
    try {
        const res = await apiFetchData<AdminStats>('/v1/AdminDashboard/stats')
        return res
    } catch (error) {
        console.error('Failed to fetch admin stats:', error)
        return null
    }
}

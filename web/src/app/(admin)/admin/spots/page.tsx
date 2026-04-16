import { requireAuth } from '@/features/auth/guard'
import { getAdminSpots } from '@/features/admin/spots-actions'
import AdminSpotsClient from './admin-spots-client'

export default async function AdminSpotsPage() {
    const session = await requireAuth('/admin/spots')
    const data = await getAdminSpots(1, 100)

    return (
        <AdminSpotsClient
            userName={session.userName}
            initialSpots={data?.data || []}
        />
    )
}

import { requireAuth } from '@/features/auth/guard'
import { getCurrentUser } from '@/features/account/actions'
import { getAdminSpots } from '@/features/admin/spots-actions'
import AdminSpotsClient from './admin-spots-client'

export default async function AdminSpotsPage() {
    const session = await requireAuth('/admin/spots')
    const [dataResult, userResult] = await Promise.allSettled([
        getAdminSpots(1, 100),
        getCurrentUser(),
    ])
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null
    const user = userResult.status === 'fulfilled' ? userResult.value : null

    return (
        <AdminSpotsClient
            userName={session.userName}
            profilePhotoUrl={user?.profilePhotoUrl}
            initialSpots={data?.data || []}
        />
    )
}

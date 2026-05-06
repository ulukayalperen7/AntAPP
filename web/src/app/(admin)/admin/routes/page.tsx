import { requireAuth } from '@/features/auth/guard'
import { getCurrentUser } from '@/features/account/actions'
import { getAdminRoutes } from '@/features/admin/routes-actions'
import AdminRoutesClient from './admin-routes-client'

export default async function AdminRoutesPage() {
  const session = await requireAuth('/admin/routes')
  const [dataResult, userResult] = await Promise.allSettled([
    getAdminRoutes(1, 100),
    getCurrentUser(),
  ])
  const data = dataResult.status === 'fulfilled' ? dataResult.value : null
  const user = userResult.status === 'fulfilled' ? userResult.value : null

  return (
    <AdminRoutesClient
      userName={session.userName}
      email={session.email}
      profilePhotoUrl={user?.profilePhotoUrl}
      initialRoutes={data?.data || []}
    />
  )
}

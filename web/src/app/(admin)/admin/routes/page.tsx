import { requireAuth } from '@/features/auth/guard'
import { getAdminRoutes } from '@/features/admin/routes-actions'
import AdminRoutesClient from './admin-routes-client'

export default async function AdminRoutesPage() {
  const session = await requireAuth('/admin/routes')
  const data = await getAdminRoutes(1, 100)

  return (
    <AdminRoutesClient
      userName={session.userName}
      email={session.email}
      initialRoutes={data?.data || []}
    />
  )
}

import { requireAuth } from '@/features/auth/guard'
import { getCurrentUser } from '@/features/account/actions'
import { getAdminUsers } from '@/features/admin/users-actions'
import AdminUsersClient from './admin-users-client'

export default async function AdminUsersPage() {
  const session = await requireAuth('/admin/users')
  const [dataResult, userResult] = await Promise.allSettled([
    getAdminUsers(1, 100),
    getCurrentUser(),
  ])
  const data = dataResult.status === 'fulfilled' ? dataResult.value : null
  const user = userResult.status === 'fulfilled' ? userResult.value : null

  return (
    <AdminUsersClient
      userName={session.userName}
      email={session.email}
      profilePhotoUrl={user?.profilePhotoUrl}
      initialUsers={data?.data || []}
    />
  )
}

import { requireAuth } from '@/features/auth/guard'
import { getAdminUsers } from '@/features/admin/users-actions'
import AdminUsersClient from './admin-users-client'

export default async function AdminUsersPage() {
  const session = await requireAuth('/admin/users')
  const data = await getAdminUsers(1, 100)

  return (
    <AdminUsersClient
      userName={session.userName}
      email={session.email}
      initialUsers={data?.data || []}
    />
  )
}

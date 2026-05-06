import { requireAuth } from '@/features/auth/guard'
import { getCurrentUser } from '@/features/account/actions'
import AdminDashboard from './admin-dashboard'

export default async function AdminPage() {
  const session = await requireAuth('/admin')
  const userResult = await Promise.allSettled([getCurrentUser()])
  const user = userResult[0].status === 'fulfilled' ? userResult[0].value : null

  return (
    <AdminDashboard
      userName={session.userName}
      email={session.email}
      profilePhotoUrl={user?.profilePhotoUrl}
      roles={session.roles}
    />
  )
}

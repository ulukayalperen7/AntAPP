import { requireAuth } from '@/features/auth/guard'
import AdminDashboard from './admin-dashboard'

export default async function AdminPage() {
  const session = await requireAuth('/admin')

  return (
    <AdminDashboard
      userName={session.userName}
      email={session.email}
      roles={session.roles}
    />
  )
}

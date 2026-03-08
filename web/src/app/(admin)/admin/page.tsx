import Link from 'next/link'
import { logout } from '@/features/auth/actions'
import { requireAuth } from '@/features/auth/guard'

export default async function AdminPage() {
  const session = await requireAuth('/admin')

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <h1>Admin Panel</h1>
      <p>
        <strong>{session.userName}</strong> ({session.email})
      </p>
      <p>Roles: {session.roles.join(', ')}</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Link href="/">User</Link>
        <Link href="/business">Business</Link>
        <Link href="/admin">Admin</Link>
      </div>

      <form action={logout} style={{ marginTop: 24 }}>
        <button type="submit">Logout</button>
      </form>
    </main>
  )
}

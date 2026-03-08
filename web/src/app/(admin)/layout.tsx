import { requireAuth } from '@/features/auth/guard'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth('/admin')
  return <>{children}</>
}

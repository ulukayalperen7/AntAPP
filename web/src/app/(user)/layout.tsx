import { requireAuth } from '@/features/auth/guard'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth('/')
  return <>{children}</>
}

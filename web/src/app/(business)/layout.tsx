import { requireAuth } from '@/features/auth/guard'

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth('/business')
  return <>{children}</>
}

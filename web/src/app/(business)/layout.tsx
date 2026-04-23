import { Theme } from '@antapp/ui'
import { requireAuth } from '@/features/auth/guard'

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth('/business')
  return <Theme name="business">{children}</Theme>
}

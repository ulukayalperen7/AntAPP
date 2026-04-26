import { requireAuth } from '@/features/auth/guard'
import { getServerSession } from '@/features/auth/session'
import { UserShellWrapper } from './user-shell-wrapper'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth('/')
  const session = await getServerSession()

  return (
    <UserShellWrapper userId={session?.id} userName={session?.userName}>
      {children}
    </UserShellWrapper>
  )
}

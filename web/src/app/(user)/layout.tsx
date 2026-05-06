import { requireAuth } from '@/features/auth/guard'
import { getServerSession } from '@/features/auth/session'
import { getCurrentUser } from '@/features/account/actions'
import { UserShellWrapper } from './user-shell-wrapper'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth('/dashboard')
  const session = await getServerSession()
  const userResult = await Promise.allSettled([getCurrentUser()])
  const user = userResult[0].status === 'fulfilled' ? userResult[0].value : null

  return (
    <UserShellWrapper userId={session?.id} userName={user?.userName ?? session?.userName} profilePhotoUrl={user?.profilePhotoUrl} roles={session?.roles ?? []}>
      {children}
    </UserShellWrapper>
  )
}

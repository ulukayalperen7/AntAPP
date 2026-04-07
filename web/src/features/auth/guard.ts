import { redirect } from 'next/navigation'
import { canAccessPath, getLandingPathByRoles } from './roles'
import { getServerSession } from './session'

export async function requireAuth(pathname: string) {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  if (!canAccessPath(pathname, session.roles, session.userName)) {
    redirect(getLandingPathByRoles(session.roles, session.userName))
  }

  return session
}

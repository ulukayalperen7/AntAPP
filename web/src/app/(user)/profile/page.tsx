import { getCurrentUser } from '@/features/account/actions'
import { getOwnRoutes } from '@/features/routes/actions'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const userResult = await Promise.allSettled([getCurrentUser()])
  const user = userResult[0].status === 'fulfilled' ? userResult[0].value : null

  const myRoutes = user
    ? await getOwnRoutes(user.id)
    : []

  return <ProfileClient user={user} routes={myRoutes} />
}

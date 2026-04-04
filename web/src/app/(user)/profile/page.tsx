import { getCurrentUser } from '@/features/account/actions'
import { getRoutes } from '@/features/routes/actions'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const [userResult, routesResult] = await Promise.allSettled([
    getCurrentUser(),
    getRoutes({ pageSize: 20 }),
  ])

  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const routes = routesResult.status === 'fulfilled' ? routesResult.value.data : []

  // Filter routes by this user's id once we have the user
  const myRoutes = user
    ? routes.filter((r) => r.authorUserId === user.id)
    : []

  return <ProfileClient user={user} routes={myRoutes} />
}

import { getCurrentUser } from '@/features/account/actions'
import { getRoutes } from '@/features/routes/actions'
import ProfileClient from '../profile/profile-client'

export default async function MyRoutesPage() {
    const [userResult, routesResult] = await Promise.allSettled([
        getCurrentUser(),
        getRoutes({ pageSize: 20 }),
    ])

    const user = userResult.status === 'fulfilled' ? userResult.value : null
    const routes = routesResult.status === 'fulfilled' ? routesResult.value.data : []

    const myRoutes = user
        ? routes.filter((r) => r.authorUserId === user.id)
        : []

    return <ProfileClient user={user} routes={myRoutes} />
}

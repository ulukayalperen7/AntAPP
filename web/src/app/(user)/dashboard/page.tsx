import { getRoutes } from '@/features/routes/actions'
import { getCurrentUser } from '@/features/account/actions'
import HomeClient from '../home-client'

export default async function DashboardPage() {
  const [timelineResult, spotlightResult, userResult] = await Promise.allSettled([
    getRoutes({ sort: 'newest', pageSize: 12 }),
    getRoutes({ sort: 'rating', type: 'official', pageSize: 4 }),
    getCurrentUser(),
  ])

  const timelineRoutes = timelineResult.status === 'fulfilled' ? timelineResult.value.data : []
  const spotlightRoutes = spotlightResult.status === 'fulfilled' ? spotlightResult.value.data : []
  const currentUserName = userResult.status === 'fulfilled' ? userResult.value.userName : null

  return (
    <HomeClient
      mode="timeline"
      timelineRoutes={timelineRoutes}
      spotlightRoutes={spotlightRoutes}
      currentUserName={currentUserName}
    />
  )
}

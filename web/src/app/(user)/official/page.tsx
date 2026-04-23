import { getRoutes } from '@/features/routes/actions'
import { getCurrentUser } from '@/features/account/actions'
import HomeClient from '../home-client'

export default async function OfficialPage() {
  const [timelineResult, spotlightResult, userResult] = await Promise.allSettled([
    getRoutes({ sort: 'rating', type: 'official', pageSize: 12 }),
    getRoutes({ sort: 'newest', pageSize: 4 }),
    getCurrentUser(),
  ])

  const timelineRoutes = timelineResult.status === 'fulfilled' ? timelineResult.value.data : []
  const spotlightRoutes = spotlightResult.status === 'fulfilled' ? spotlightResult.value.data : []
  const currentUserName = userResult.status === 'fulfilled' ? userResult.value.userName : null

  return (
    <HomeClient
      mode="official"
      timelineRoutes={timelineRoutes}
      spotlightRoutes={spotlightRoutes}
      currentUserName={currentUserName}
    />
  )
}

import { getRoutes } from '@/features/routes/actions'
import HomeClient from '../home-client'

export default async function CommunityPage() {
  const [timelineResult, spotlightResult] = await Promise.allSettled([
    getRoutes({ sort: 'newest', type: 'community', pageSize: 12 }),
    getRoutes({ sort: 'rating', type: 'official', pageSize: 4 }),
  ])

  const timelineRoutes = timelineResult.status === 'fulfilled' ? timelineResult.value.data : []
  const spotlightRoutes = spotlightResult.status === 'fulfilled' ? spotlightResult.value.data : []

  return (
    <HomeClient
      mode="community"
      timelineRoutes={timelineRoutes}
      spotlightRoutes={spotlightRoutes}
    />
  )
}

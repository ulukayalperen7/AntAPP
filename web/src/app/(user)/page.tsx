import { getRoutes } from '@/features/routes/actions'
import HomeClient from './home-client'

export default async function ExplorePage() {
  const [timelineResult, spotlightResult] = await Promise.allSettled([
    getRoutes({ sort: 'newest', pageSize: 12 }),
    getRoutes({ sort: 'rating', type: 'official', pageSize: 4 }),
  ])

  const timelineRoutes = timelineResult.status === 'fulfilled' ? timelineResult.value.data : []
  const spotlightRoutes = spotlightResult.status === 'fulfilled' ? spotlightResult.value.data : []

  return (
    <HomeClient
      mode="timeline"
      timelineRoutes={timelineRoutes}
      spotlightRoutes={spotlightRoutes}
    />
  )
}

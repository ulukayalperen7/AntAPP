import { getRoutes, getTags } from '@/features/routes/actions'
import HomeClient from '../home-client'

export default async function DashboardPage() {
  // Fetch tags first (needed for filters)
  const tags = await getTags()

  // Fetch routes
  const [popularResult, recommendedResult] = await Promise.allSettled([
    getRoutes({ sort: 'rating', type: 'official', pageSize: 8 }),
    getRoutes({ sort: 'newest', type: 'community', pageSize: 6 }),
  ])

  const popularRoutes = popularResult.status === 'fulfilled' ? popularResult.value.data : []
  const recommendedRoutes = recommendedResult.status === 'fulfilled' ? recommendedResult.value.data : []

  return (
    <HomeClient
      popularRoutes={popularRoutes}
      recommendedRoutes={recommendedRoutes}
      tags={tags}
    />
  )
}

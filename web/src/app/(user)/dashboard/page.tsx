import { getRoutes, getTags } from '@/features/routes/actions'
import HomeClient from '../home-client'

export default async function DashboardPage() {
  const [popularResult, recommendedResult, tags] = await Promise.allSettled([
    getRoutes({ sort: 'rating', type: 'official', pageSize: 8 }),
    getRoutes({ sort: 'newest', type: 'community', pageSize: 6 }),
    getTags(),
  ])

  const popularRoutes = popularResult.status === 'fulfilled' ? popularResult.value.data : []
  const recommendedRoutes = recommendedResult.status === 'fulfilled' ? recommendedResult.value.data : []
  const tagList = tags.status === 'fulfilled' ? tags.value : []

  return (
    <HomeClient
      popularRoutes={popularRoutes}
      recommendedRoutes={recommendedRoutes}
      tags={tagList}
    />
  )
}

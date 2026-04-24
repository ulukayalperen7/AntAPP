import { getRoutes } from '@/features/routes/actions'
import { getCurrentUser } from '@/features/account/actions'
import { getFeedPosts } from '@/features/posts/actions'
import { mapFeedPostsToRouteCards } from '@/features/posts/mappers'
import HomeClient from '../home-client'

export default async function CommunityPage() {
  const [feedResult, fallbackResult, spotlightResult, userResult] = await Promise.allSettled([
    getFeedPosts('community', 1, 12),
    getRoutes({ sort: 'newest', type: 'community', pageSize: 12 }),
    getRoutes({ sort: 'rating', type: 'official', pageSize: 4 }),
    getCurrentUser(),
  ])

  const feedRoutes = feedResult.status === 'fulfilled'
    ? mapFeedPostsToRouteCards(feedResult.value.data)
    : []
  const fallbackRoutes = fallbackResult.status === 'fulfilled' ? fallbackResult.value.data : []
  const timelineRoutes = feedRoutes.length > 0 ? feedRoutes : fallbackRoutes
  const spotlightRoutes = spotlightResult.status === 'fulfilled' ? spotlightResult.value.data : []
  const currentUserName = userResult.status === 'fulfilled' ? userResult.value.userName : null

  return (
    <HomeClient
      mode="community"
      timelineRoutes={timelineRoutes}
      spotlightRoutes={spotlightRoutes}
      currentUserName={currentUserName}
      referenceNowIso={new Date().toISOString()}
    />
  )
}

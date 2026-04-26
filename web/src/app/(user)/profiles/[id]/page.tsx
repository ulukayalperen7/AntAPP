import { notFound } from 'next/navigation'
import { getPublicProfile } from '@/features/account/actions'
import { getFeedPosts } from '@/features/posts/actions'
import { mapFeedPostsToRouteCards } from '@/features/posts/mappers'
import { getRoutes } from '@/features/routes/actions'
import PublicProfileClient from './profile-detail-client'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [profileResult, postsResult, routesResult] = await Promise.allSettled([
    getPublicProfile(id),
    getFeedPosts('timeline', 1, 12, id),
    getRoutes({ authorId: id, visibility: 'public', pageSize: 12, sort: 'newest' }),
  ])

  if (profileResult.status === 'rejected') {
    notFound()
  }

  const posts = postsResult.status === 'fulfilled'
    ? mapFeedPostsToRouteCards(postsResult.value.data)
    : []

  return (
    <PublicProfileClient
      profile={profileResult.value}
      posts={posts}
      routes={routesResult.status === 'fulfilled' ? routesResult.value.data : []}
    />
  )
}

import { getPostById } from '@/features/posts/actions'
import { getCurrentUser } from '@/features/account/actions'
import PostDetailClient from './post-detail-client'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ postId: string }>
}

export default async function PostDetailPage({ params }: Props) {
  const { postId } = await params
  const [postResult, userResult] = await Promise.allSettled([
    getPostById(postId),
    getCurrentUser(),
  ])

  if (postResult.status === 'rejected') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Post not found or is no longer available.</p>
      </div>
    )
  }

  const post = postResult.value
  const currentUserName = userResult.status === 'fulfilled' ? userResult.value.userName : null

  return <PostDetailClient post={post} currentUserName={currentUserName} />
}

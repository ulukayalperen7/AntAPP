import type { FeedPostItem, RouteListItem } from '@/features/api/types'

export function mapFeedPostsToRouteCards(posts: FeedPostItem[]): RouteListItem[] {
  return posts.map((post) => ({
    id: post.routeId,
    title: post.routeTitle,
    description: post.routeDescription,
    thumbnailUrl: post.routeThumbnailUrl,
    authorUserId: post.authorUserId,
    authorUserName: post.authorUserName,
    postId: post.postId,
    postContent: post.content,
    postImageUrls: post.imageUrls,
    postReactionCount: post.reactionCount,
    postCommentCount: post.commentCount,
    postShareCount: post.shareCount,
    isReactedByCurrentUser: post.isReactedByCurrentUser,
    isSharedByCurrentUser: post.isSharedByCurrentUser,
    contentType: post.routeContentType,
    isPublic: post.routeIsPublic,
    createdAt: post.createdAt,
    averageRating: post.routeAverageRating,
  }))
}

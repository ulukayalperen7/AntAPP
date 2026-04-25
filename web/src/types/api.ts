// Backend API response wrapper tipleri
// Response<T> → { succeeded, message, errors, data }
// PagedResponse<T> → { pageNumber, pageSize, totalRecords, totalPages, data }

export type ApiResponse<T> = {
  succeeded: boolean
  message: string | null
  errors: string[] | null
  data: T
}

export type PagedApiResponse<T> = {
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  data: T[]
}

// ─── Auth ───────────────────────────────────────────────

export type AuthUser = {
  id: string
  userName: string
  email: string
  roles: string[]
  isVerified: boolean
  jwToken: string
  refreshToken: string
}

// ─── Account ────────────────────────────────────────────

export type CurrentUser = {
  id: string
  userName: string
  email: string
  profilePhotoUrl: string | null
  isVerified: boolean
  roles: string[]
}

// ─── Tags ───────────────────────────────────────────────

export type Tag = {
  id: string
  name: string
  isActive: boolean
  description?: string
  createdAt?: string
}



// ─── Routes ─────────────────────────────────────────────

export type RouteContentType = 'Community' | 'Official' | 'Sponsored'
export type RouteType = 'Walking' | 'Bicycling' | 'Driving' | 'Transit'

export type RouteListItem = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  authorUserId: string
  authorUserName?: string | null
  originalAuthorName?: string | null
  postId?: string
  postContent?: string | null
  postImageUrls?: string[]
  postReactionCount?: number
  postCommentCount?: number
  postShareCount?: number
  isReactedByCurrentUser?: boolean
  isSharedByCurrentUser?: boolean
  contentType: RouteContentType
  isPublic: boolean
  createdAt: string
  averageRating: number
}

export type FeedPostItem = {
  postId: string
  content: string | null
  createdAt: string
  isPublic: boolean
  authorUserId: string
  authorUserName: string | null
  routeId: string
  routeTitle: string
  routeDescription: string | null
  routeThumbnailUrl: string | null
  routeContentType: RouteContentType
  routeIsPublic: boolean
  routeAverageRating: number
  imageUrls: string[]
  reactionCount: number
  commentCount: number
  shareCount: number
  isReactedByCurrentUser: boolean
  isSharedByCurrentUser: boolean
}

export type PostCommentItem = {
  commentId: string
  postId: string
  userId: string
  userName: string | null
  content: string
  createdAt: string
}

export type PostReactionItem = {
  reactionId: string
  postId: string
  userId: string
  userName: string | null
  createdAt: string
}

export type PostReactionSummary = {
  postId: string
  isReactedByCurrentUser: boolean
  reactionCount: number
}

export type PostShareSummary = {
  postId: string
  isSharedByCurrentUser: boolean
  shareCount: number
}

export type PostCommentCreateResult = {
  commentId: string
  postId: string
  commentCount: number
}

export type RouteStop = {
  spotId: string
  order: number
  name: string
  spotName?: string | null
  customTitle?: string | null
  description: string | null
  photoUrl: string | null
  latitude: number
  longitude: number
}

export type RouteDetail = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  authorUserId: string
  originalAuthorName?: string | null
  isPublic: boolean
  contentType: RouteContentType
  averageRating: number
  encodedPolyline: string | null
  totalDistanceMeters: number
  estimatedDurationSeconds: number
  centerLatitude: number
  centerLongitude: number
  stops: RouteStop[]
}

// ─── Route Stops (standalone) ───────────────────────────

export type RouteStopItem = {
  id: string
  spotId: string
  order: number
  name: string
  spotName?: string | null
  description: string | null
  photoUrl: string | null
  latitude: number
  longitude: number
  customTitle: string | null
  customDescription: string | null
}

// ─── Collections ────────────────────────────────────────

export type Collection = {
  id: string
  name: string
  isDefault: boolean
  isPublic: boolean
  description: string | null
  thumbnailUrl: string | null
  createdAt: string
  routeCount: number
}

export type CollectionDetail = {
  id: string
  name: string
  isDefault: boolean
  isPublic: boolean
  description: string | null
  thumbnailUrl: string | null
  createdAt: string
  routes: RouteListItem[]
}

export type AdminCollection = {
  id: string
  userId: string
  name: string
  isDefault: boolean
  isPublic: boolean
  description: string | null
  thumbnailUrl: string | null
  routeCount: number
  createdAt: string
}

export type AdminCollectionRouteItem = {
  routeId: string
  title: string | null
  thumbnailUrl: string | null
  savedAt: string
}

export type AdminCollectionDetail = {
  id: string
  userId: string
  name: string
  isDefault: boolean
  isPublic: boolean
  description: string | null
  thumbnailUrl: string | null
  createdAt: string
  routes: AdminCollectionRouteItem[]
}

// ─── Spots ──────────────────────────────────────────────

export type SpotListItem = {
  id: string
  name: string
  description: string | null
  photoUrl: string | null
  latitude: number
  longitude: number
  averageRating: number
}

export type SpotDetail = SpotListItem & {
  ratingCount: number
  createdAt: string
}

export type SpotRouteItem = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  authorUserId: string
  averageRating: number
}

export type BusinessSpotItem = {
  id: string
  name: string
  description: string | null
  photoUrl: string | null
  latitude: number
  longitude: number
  isActive: boolean
  averageRating: number
  createdAt: string
}

// ─── Ratings ────────────────────────────────────────────

export type RouteRating = {
  id: string
  routeId: string
  userId: string
  score: number
  createdAt: string
}

export type RouteRatingResult = {
  ratingId: string
  routeId: string
  currentUserRating: number
  averageRating: number
  ratingCount: number
}

export type SpotRatingResult = {
  ratingId: string
  spotId: string
  currentUserRating: number
  averageRating: number
  ratingCount: number
}

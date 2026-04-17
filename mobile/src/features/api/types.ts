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

export type CurrentUser = {
  id: string
  userName: string
  email: string
  profilePhotoUrl: string | null
  isVerified: boolean
  roles: string[]
}

export type Tag = {
  id: string
  name: string
  isActive: boolean
}

export type RouteContentType = 'Community' | 'Official' | 'Sponsored'

export type RouteListItem = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  authorUserId: string
  contentType: RouteContentType
  isPublic: boolean
  createdAt: string
  averageRating: number
}

export type RouteStop = {
  spotId: string
  order: number
  name: string
  description: string | null
  photoUrl: string | null
  latitude: number
  longitude: number
}

export type RouteStopItem = {
  id: string
  spotId: string
  order: number
  name: string
  description: string | null
  photoUrl: string | null
  latitude: number
  longitude: number
  customTitle: string | null
  customDescription: string | null
}

export type RouteDetail = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  authorUserId: string
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

export type CollectionRouteItem = {
  routeId: string
  title: string | null
  thumbnailUrl: string | null
  savedAt: string
}

export type CollectionDetail = {
  id: string
  userId: string
  name: string
  isDefault: boolean
  isPublic: boolean
  description: string | null
  thumbnailUrl: string | null
  createdAt: string
  routes: CollectionRouteItem[]
}

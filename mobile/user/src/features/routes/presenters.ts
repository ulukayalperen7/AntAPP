import type { RouteCardData } from '@antapp/ui'
import type { RouteListItem } from '@/features/api/types'

export function routeToCardData(route: RouteListItem): RouteCardData {
  return {
    id: route.id,
    title: route.title,
    description: route.description ?? undefined,
    image: route.thumbnailUrl ?? undefined,
    rating: route.averageRating > 0 ? route.averageRating : undefined,
    contentType: route.contentType,
    isOfficial: route.contentType === 'Official',
  }
}

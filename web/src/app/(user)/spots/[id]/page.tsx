import { notFound } from 'next/navigation'
import { getSpotById, getSpotRoutes } from '@/features/spots/actions'
import SpotDetailClient from './spot-detail-client'

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [spotResult, routesResult] = await Promise.allSettled([
    getSpotById(id),
    getSpotRoutes(id, 1, 12),
  ])

  if (spotResult.status === 'rejected') {
    notFound()
  }

  return (
    <SpotDetailClient
      spot={spotResult.value}
      initialRoutes={routesResult.status === 'fulfilled' ? routesResult.value.data : []}
    />
  )
}

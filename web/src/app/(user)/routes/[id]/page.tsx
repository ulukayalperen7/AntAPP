import { getRouteById } from '@/features/routes/actions'
import RouteDetailClient from './route-detail-client'
import { notFound } from 'next/navigation'

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const route = await getRouteById(id)
    return <RouteDetailClient route={route} />
  } catch {
    notFound()
  }
}

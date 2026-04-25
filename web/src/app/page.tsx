import { getRoutes } from '@/features/routes/actions'
import { LandingPageClient } from './landing-page-client'

export const revalidate = 300

export default async function LandingPage() {
  const featuredRoutesResult = await Promise.allSettled([
    getRoutes({ sort: 'rating', type: 'official', pageSize: 6 }),
  ])

  const featuredRoutes = featuredRoutesResult[0].status === 'fulfilled'
    ? featuredRoutesResult[0].value.data
    : []

  return <LandingPageClient featuredRoutes={featuredRoutes} />
}

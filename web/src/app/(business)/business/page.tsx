import { requireAuth } from '@/features/auth/guard'
import { canAccessAdmin } from '@/features/auth/roles'
import { getBusinessSpots } from '@/features/spots/actions'
import type { BusinessSpotItem } from '@/types/api'
import BusinessSpotsClient from './business-spots-client'

export default async function BusinessPage() {
  const session = await requireAuth('/business')

  let initialSpots: BusinessSpotItem[] = []
  let initialTotal = 0

  try {
    const spotsResult = await getBusinessSpots(1, 50)
    initialSpots = spotsResult.data
    initialTotal = spotsResult.totalRecords
  } catch {}

  return (
    <BusinessSpotsClient
      userName={session.userName}
      email={session.email}
      roles={session.roles}
      isAdmin={canAccessAdmin(session.roles)}
      initialSpots={initialSpots}
      initialTotal={initialTotal}
    />
  )
}

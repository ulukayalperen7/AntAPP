import { requireAuth } from '@/features/auth/guard'
import { canAccessAdmin } from '@/features/auth/roles'
import { getCurrentUser } from '@/features/account/actions'
import { getBusinessSpots } from '@/features/spots/actions'
import type { BusinessSpotItem } from '@/types/api'
import BusinessSpotsClient from './business-spots-client'

export default async function BusinessPage() {
  const session = await requireAuth('/business')

  let initialSpots: BusinessSpotItem[] = []
  let initialTotal = 0
  let profilePhotoUrl: string | null = null

  try {
    const [spotsResult, userResult] = await Promise.allSettled([
      getBusinessSpots(1, 50),
      getCurrentUser(),
    ])

    if (spotsResult.status === 'fulfilled') {
      initialSpots = spotsResult.value.data
      initialTotal = spotsResult.value.totalRecords
    }

    if (userResult.status === 'fulfilled') {
      profilePhotoUrl = userResult.value.profilePhotoUrl
    }
  } catch {}

  return (
    <BusinessSpotsClient
      userName={session.userName}
      email={session.email}
      profilePhotoUrl={profilePhotoUrl}
      roles={session.roles}
      isAdmin={canAccessAdmin(session.roles)}
      initialSpots={initialSpots}
      initialTotal={initialTotal}
    />
  )
}

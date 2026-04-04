import { requireAuth } from '@/features/auth/guard'
import { canAccessAdmin } from '@/features/auth/roles'
import { getBusinessSpots } from '@/features/spots/actions'
import BusinessSpotsClient from './business-spots-client'

export default async function BusinessPage() {
  const session = await requireAuth('/business')
  const spotsResult = await getBusinessSpots(1, 50)

  return (
    <BusinessSpotsClient
      userName={session.userName}
      email={session.email}
      roles={session.roles}
      isAdmin={canAccessAdmin(session.roles)}
      initialSpots={spotsResult.data}
      initialTotal={spotsResult.totalRecords}
    />
  )
}

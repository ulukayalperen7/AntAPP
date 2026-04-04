import { getSpots } from '@/features/spots/actions'
import SpotsClient from './spots-client'

export default async function SpotsPage() {
  const result = await getSpots({ page: 1, pageSize: 24 })

  return (
    <SpotsClient
      initialSpots={result.data}
      initialTotal={result.totalRecords}
    />
  )
}

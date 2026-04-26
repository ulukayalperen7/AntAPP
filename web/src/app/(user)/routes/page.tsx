import { getRoutes } from '@/features/routes/actions'
import RoutesClient from './routes-client'

export default async function RoutesPage() {
    const result = await getRoutes({ page: 1, pageSize: 24, visibility: 'public' })

    return (
        <RoutesClient
            initialRoutes={result.data}
            initialTotal={result.totalRecords}
        />
    )
}

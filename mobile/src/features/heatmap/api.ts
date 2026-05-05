import { apiFetchData } from '@/features/api/client'

export async function pingHeatmap(latitude: number, longitude: number): Promise<boolean> {
  return apiFetchData<boolean>('/heatmap/ping', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  })
}

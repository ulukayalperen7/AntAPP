'use server'

import { apiFetchData } from '@/lib/api'

export async function pingHeatmap(latitude: number, longitude: number): Promise<boolean> {
  return apiFetchData<boolean>('/heatmap/ping', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  })
}

'use server'

import { apiFetch, apiFetchData, apiFetchPaged } from '@/lib/api'
import type { Tag, PagedApiResponse } from '@/types/api'

export async function getAdminTags(): Promise<Tag[]> {
  try {
    const res = await apiFetchPaged<Tag>('/admin/tags')
    return res.data
  } catch (error) {
    console.error('Failed to fetch admin tags:', error)
    return []
  }
}

export async function createAdminTag(
  name: string,
  description?: string
): Promise<Tag> {
  return apiFetchData<Tag>('/admin/tags', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

export async function updateAdminTag(
  id: string,
  name: string,
  description?: string
): Promise<Tag> {
  return apiFetchData<Tag>(`/admin/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  })
}

export async function deleteAdminTag(id: string): Promise<void> {
  await apiFetchData<string>(`/admin/tags/${id}`, {
    method: 'DELETE',
  })
}

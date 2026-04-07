'use server'

import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  API_URL,
} from '@/features/auth/constants'

type Category = {
  id: string
  name: string
  description?: string
  createdAt?: string
}

export async function getAdminCategories(): Promise<Category[]> {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value

  try {
    const res = await fetch(`${API_URL}/admin/categories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to fetch categories')
    return await res.json()
  } catch {
    return []
  }
}

export async function createAdminCategory(
  name: string,
  description?: string
): Promise<Category> {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value

  const res = await fetch(`${API_URL}/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ name, description }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? 'Failed to create category')
  }

  return await res.json()
}

export async function updateAdminCategory(
  id: string,
  name: string,
  description?: string
): Promise<Category> {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value

  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ name, description }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('Failed to update category')
  return await res.json()
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value

  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('Failed to delete category')
}

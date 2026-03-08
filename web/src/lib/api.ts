import 'server-only'

import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, API_URL } from '@/features/auth/constants'

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value
  const headers = new Headers(options?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: options?.cache ?? 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

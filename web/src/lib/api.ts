import 'server-only'

import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, API_URL } from '@/features/auth/constants'
import type { ApiResponse, PagedApiResponse } from '@/types/api'

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

  const method = options?.method?.toUpperCase() || 'GET'
  const isGet = method === 'GET'

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: options?.cache ?? (isGet ? 'force-cache' : 'no-store'),
    ...(isGet && !options?.cache ? { next: { revalidate: 60 } } : {}),
  })

  if (!res.ok) {
    let message = `API error: ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
      else if (body?.errors && Array.isArray(body.errors)) message = body.errors[0]
    } catch { /* ignore */ }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

/** Unwraps Response<T> wrapper from backend and returns T */
export async function apiFetchData<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const wrapped = await apiFetch<ApiResponse<T>>(path, options)
  return wrapped.data
}

/** Unwraps PagedResponse<T> wrapper from backend */
export async function apiFetchPaged<T>(
  path: string,
  options?: RequestInit
): Promise<PagedApiResponse<T>> {
  return apiFetch<PagedApiResponse<T>>(path, options)
}

export { API_URL }


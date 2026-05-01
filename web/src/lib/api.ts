import 'server-only'

import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, API_URL } from '@/features/auth/constants'
import type { ApiResponse, PagedApiResponse } from '@/types/api'

type ApiFetchOptions = RequestInit & {
  includeAuth?: boolean
  revalidate?: number | false
}

async function request<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const headers = new Headers(options?.headers)
  const method = options?.method?.toUpperCase() ?? 'GET'
  const isGet = method === 'GET'

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options?.includeAuth !== false) {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const revalidate = options?.revalidate
  const cache = options?.cache
    ?? (isGet
      ? (typeof revalidate === 'number' ? 'force-cache' : 'no-store')
      : 'no-store')

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache,
    ...(typeof revalidate === 'number' ? { next: { revalidate } } : {}),
  })

  if (!res.ok) {
    let message = `API error: ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
      else if (body?.errors && Array.isArray(body.errors)) message = body.errors[0]
    } catch {}
    
    // Log the actual backend fetch failure clearly to the Next.js console
    console.error(`[API Fetch Failed] ${options?.method || 'GET'} ${API_URL}${path} -> ${res.status} ${message}`)
    
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  return request<T>(path, { ...options, includeAuth: true })
}

export function publicApiFetch<T>(path: string, options?: Omit<ApiFetchOptions, 'includeAuth'>): Promise<T> {
  return request<T>(path, { ...options, includeAuth: false })
}

/** Unwraps Response<T> wrapper from backend and returns T */
export async function apiFetchData<T>(
  path: string,
  options?: ApiFetchOptions
): Promise<T> {
  const wrapped = await apiFetch<ApiResponse<T>>(path, options)
  return wrapped.data
}

export async function publicApiFetchData<T>(
  path: string,
  options?: Omit<ApiFetchOptions, 'includeAuth'>
): Promise<T> {
  const wrapped = await publicApiFetch<ApiResponse<T>>(path, options)
  return wrapped.data
}

/** Unwraps PagedResponse<T> wrapper from backend */
export async function apiFetchPaged<T>(
  path: string,
  options?: ApiFetchOptions
): Promise<PagedApiResponse<T>> {
  return apiFetch<PagedApiResponse<T>>(path, options)
}

export async function publicApiFetchPaged<T>(
  path: string,
  options?: Omit<ApiFetchOptions, 'includeAuth'>
): Promise<PagedApiResponse<T>> {
  return publicApiFetch<PagedApiResponse<T>>(path, options)
}

export { API_URL }


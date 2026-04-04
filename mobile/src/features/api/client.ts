import { clearAuthSession, loadAuthSession, persistAuthSession } from '@/features/auth/storage'
import { refreshWithToken } from '@/features/auth/api'
import type { AuthResponse } from '@/features/auth/types'
import type { ApiResponse, PagedApiResponse } from './types'

const API_URL = process.env.EXPO_PUBLIC_API_URL

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is not set')
}

function readMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null

  const directMessage = (data as { message?: unknown }).message
  if (typeof directMessage === 'string' && directMessage.length > 0) {
    return directMessage
  }

  const errors = (data as { errors?: unknown }).errors
  if (Array.isArray(errors) && typeof errors[0] === 'string') {
    return errors[0]
  }

  return null
}

function toSession(data: AuthResponse) {
  return {
    accessToken: data.jwToken,
    refreshToken: data.refreshToken,
    user: {
      id: data.id,
      userName: data.userName,
      email: data.email,
      roles: data.roles,
    },
  }
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return readMessage(data) ?? `API error: ${res.status}`
  } catch {
    const text = (await res.text()).trim()
    return text || `API error: ${res.status}`
  }
}

async function authorizedFetch(path: string, options?: RequestInit, hasRetried = false): Promise<Response> {
  const session = await loadAuthSession()
  const headers = new Headers(options?.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status !== 401 || hasRetried || !session?.refreshToken) {
    return response
  }

  try {
    const refreshed = await refreshWithToken(session.refreshToken)
    const nextSession = toSession(refreshed)
    await persistAuthSession(nextSession)

    const retryHeaders = new Headers(options?.headers)
    if (!retryHeaders.has('Content-Type')) {
      retryHeaders.set('Content-Type', 'application/json')
    }
    retryHeaders.set('Authorization', `Bearer ${nextSession.accessToken}`)

    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: retryHeaders,
    })
  } catch {
    await clearAuthSession()
    return response
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await authorizedFetch(path, options)

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return response.json() as Promise<T>
}

export async function apiFetchData<T>(path: string, options?: RequestInit): Promise<T> {
  const wrapped = await apiFetch<ApiResponse<T>>(path, options)
  return wrapped.data
}

export async function apiFetchPaged<T>(path: string, options?: RequestInit): Promise<PagedApiResponse<T>> {
  return apiFetch<PagedApiResponse<T>>(path, options)
}

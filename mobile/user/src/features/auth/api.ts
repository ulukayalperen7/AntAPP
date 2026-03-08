import type { AuthResponse } from './types'

const API_URL = process.env.EXPO_PUBLIC_API_URL

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is not set')
}

function readMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const message = (data as { message?: unknown }).message
  if (typeof message === 'string' && message.length > 0) return message
  return null
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

async function post<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(await parseApiError(res))
  }

  return (await res.json()) as T
}

export function authenticate(email: string, password: string) {
  return post<AuthResponse>('/auth/login', { email, password })
}

export function refreshWithToken(refreshToken: string) {
  return post<AuthResponse>(
    '/auth/refresh',
    { refreshToken },
    { Cookie: `refreshToken=${refreshToken}` }
  )
}

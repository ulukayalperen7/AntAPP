'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AuthUser } from './types'
import {
  ACCESS_MAX_AGE,
  ACCESS_TOKEN_COOKIE,
  API_URL,
  REFRESH_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
} from './constants'
import { getLandingPathByRoles } from './roles'

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
    path: '/',
  }
}

function readBackendError(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const message = (data as { message?: unknown }).message
  return typeof message === 'string' && message.length > 0 ? message : null
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return readBackendError(data) ?? 'Request failed'
  } catch {
    const text = (await res.text()).trim()
    return text || 'Request failed'
  }
}

async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies()
  jar.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOpts(ACCESS_MAX_AGE))
  jar.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOpts(REFRESH_MAX_AGE))
}

async function clearAuthCookies() {
  const jar = await cookies()
  jar.delete(ACCESS_TOKEN_COOKIE)
  jar.delete(REFRESH_TOKEN_COOKIE)
}

export async function login(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let data: AuthUser & { refreshToken: string }
  try {
    const res = await fetch(`${API_URL}/account/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
    if (!res.ok) return await parseError(res)
    data = await res.json()
  } catch {
    return 'Network error'
  }

  await setAuthCookies(data.jwToken, data.refreshToken)
  redirect(getLandingPathByRoles(data.roles))
}

export async function logout() {
  await clearAuthCookies()
  redirect('/login')
}

export async function refreshTokens(): Promise<string> {
  const jar = await cookies()
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${API_URL}/account/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })
  if (!res.ok) {
    await clearAuthCookies()
    throw new Error(await parseError(res))
  }

  const data: { jwToken: string; refreshToken: string } = await res.json()
  await setAuthCookies(data.jwToken, data.refreshToken)
  return data.jwToken
}

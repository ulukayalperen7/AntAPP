'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AuthUser, RegisterActionState } from './types'
import {
  ACCESS_MAX_AGE,
  ACCESS_TOKEN_COOKIE,
  API_URL,
  REFRESH_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
} from './constants'
import { getLandingPathByRoles } from './roles'

function cookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }
}

function readBackendError(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>

  // Try to get a direct message first
  const message = d['message'] ?? d['Message']
  if (typeof message === 'string' && message.length > 0) return message

  // If no direct message, check for ASP.NET Core Validation errors
  const errors = d['errors'] ?? d['Errors']
  if (errors && typeof errors === 'object') {
    const errorEntries = Object.entries(errors as Record<string, string[]>)
    if (errorEntries.length > 0) {
      // Return the first error message found
      const [field, messages] = errorEntries[0]
      if (Array.isArray(messages) && messages.length > 0) {
        return messages[0]
      }
    }
  }

  return null
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
  // By omitting maxAge/expires, they become session cookies that die when the browser closes.
  jar.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOpts())
  jar.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOpts())
}

async function clearAuthCookies() {
  const jar = await cookies()
  const opts = { ...cookieOpts(), maxAge: 0, expires: new Date(0) }
  jar.set(ACCESS_TOKEN_COOKIE, '', opts)
  jar.set(REFRESH_TOKEN_COOKIE, '', opts)
  jar.delete({ name: ACCESS_TOKEN_COOKIE, path: '/' })
  jar.delete({ name: REFRESH_TOKEN_COOKIE, path: '/' })
}

export async function login(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let data: AuthUser & { refreshToken: string }
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
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
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/', 'layout')
  const landingPath = getLandingPathByRoles(data.roles, data.userName)
  redirect(landingPath)
}

export async function register(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const email = formData.get('email') as string
  const userName = formData.get('userName') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const userType = formData.get('userType') === 'business' ? 1 : 0

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userType,
        email,
        userName,
        password,
        confirmPassword,
      }),
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false, message: await parseError(res) }
    const resData = await res.json()
    const message = resData.message ?? (typeof resData === 'string' ? resData : 'Registration successful.')
    return { ok: true, message: message }
  } catch {
    return { ok: false, message: 'Network error' }
  }
}

export async function logout() {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: 'no-store',
    })
  } catch {
    // Logout devam etmeli — network hatası cookie'leri silmeyi engellemez
  }
  await clearAuthCookies()

  // Try to use API route to send Clear-Site-Data header if we could, 
  // but in Server Actions redirect does it. To bust the Next.js RSC cache:
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/', 'layout')

  redirect('/login')
}

export async function forgotPassword(
  _prevState: string | null | undefined,
  formData: FormData
): Promise<string | null | undefined> {
  const email = formData.get('email') as string
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    })
    if (!res.ok) return await parseError(res)
    return null // başarı
  } catch {
    return 'Network error'
  }
}

export async function resetPassword(
  _prevState: string | null | undefined,
  formData: FormData
): Promise<string | null | undefined> {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password, confirmPassword }),
      cache: 'no-store',
    })
    if (!res.ok) return await parseError(res)
    return null // başarı
  } catch {
    return 'Network error'
  }
}

export async function confirmEmail(userId: string, code: string): Promise<{ ok: boolean; message: string }> {
  try {
    const params = new URLSearchParams({ userId, code })
    const res = await fetch(`${API_URL}/auth/confirm-email?${params}`, {
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false, message: await parseError(res) }
    return { ok: true, message: 'Email confirmed successfully. You can now log in.' }
  } catch {
    return { ok: false, message: 'Network error' }
  }
}

export async function refreshTokens(): Promise<string> {
  const jar = await cookies()
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${API_URL}/auth/refresh`, {
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

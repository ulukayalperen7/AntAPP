'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AuthUser } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

const ACCESS_MAX_AGE = 15 * 60
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
  }
}

export async function login(
  prevState: string | null,
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
    })
    if (!res.ok) return (await res.text()) || 'Login failed'
    data = await res.json()
  } catch {
    return 'Network error'
  }

  const jar = await cookies()
  jar.set('accessToken', data.jwToken, cookieOpts(ACCESS_MAX_AGE))
  jar.set('refreshToken', data.refreshToken, cookieOpts(REFRESH_MAX_AGE))
  redirect('/')
}

export async function logout() {
  const jar = await cookies()
  jar.delete('accessToken')
  jar.delete('refreshToken')
  redirect('/login')
}

export async function refreshTokens(): Promise<string> {
  const jar = await cookies()
  const refreshToken = jar.get('refreshToken')?.value
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${API_URL}/account/refresh-token`, {
    method: 'POST',
    headers: { Cookie: `refreshToken=${refreshToken}` },
  })
  if (!res.ok) throw new Error('Token refresh failed')

  const data: { jwToken: string; refreshToken: string } = await res.json()
  jar.set('accessToken', data.jwToken, cookieOpts(ACCESS_MAX_AGE))
  jar.set('refreshToken', data.refreshToken, cookieOpts(REFRESH_MAX_AGE))
  return data.jwToken
}

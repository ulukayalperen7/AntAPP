import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ACCESS_MAX_AGE,
  ACCESS_TOKEN_COOKIE,
  API_URL,
  REFRESH_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
} from '@/features/auth/constants'
import { decodeJwtPayload, getTokenRoles, isJwtExpired } from '@/features/auth/jwt'
import { canAccessPath, getLandingPathByRoles } from '@/features/auth/roles'

const PUBLIC_PATHS = ['/login']

type RefreshResponse = {
  jwToken: string
  refreshToken: string
}

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
    path: '/',
  }
}

function applyAuthCookies(response: NextResponse, tokens: RefreshResponse) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.jwToken,
    cookieOpts(ACCESS_MAX_AGE)
  )
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOpts(REFRESH_MAX_AGE)
  )
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
}

async function refreshFromBackend(
  refreshToken: string
): Promise<RefreshResponse | null> {
  try {
    const res = await fetch(`${API_URL}/account/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })
    if (!res.ok) return null

    const data = (await res.json()) as Partial<RefreshResponse>
    if (!data.jwToken || !data.refreshToken) return null
    return { jwToken: data.jwToken, refreshToken: data.refreshToken }
  } catch {
    return null
  }
}

function withAuthUpdates(
  response: NextResponse,
  nextTokens: RefreshResponse | null,
  shouldClearCookies: boolean
) {
  if (nextTokens) {
    applyAuthCookies(response, nextTokens)
  } else if (shouldClearCookies) {
    clearAuthCookies(response)
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null

  let refreshedTokens: RefreshResponse | null = null
  let shouldClearCookies = false

  let payload = decodeJwtPayload(accessToken)
  if (!payload || isJwtExpired(payload)) {
    accessToken = null
    payload = null
    if (refreshToken) {
      const refreshed = await refreshFromBackend(refreshToken)
      if (refreshed) {
        refreshedTokens = refreshed
        accessToken = refreshed.jwToken
        payload = decodeJwtPayload(accessToken)
      } else {
        shouldClearCookies = true
      }
    } else {
      shouldClearCookies = true
    }
  }

  if (!payload || isJwtExpired(payload)) {
    if (isPublic) {
      return withAuthUpdates(NextResponse.next(), refreshedTokens, shouldClearCookies)
    }
    return withAuthUpdates(
      NextResponse.redirect(new URL('/login', request.url)),
      refreshedTokens,
      true
    )
  }

  const roles = getTokenRoles(payload)
  const landingPath = getLandingPathByRoles(roles)

  if (isPublic) {
    return withAuthUpdates(
      NextResponse.redirect(new URL(landingPath, request.url)),
      refreshedTokens,
      shouldClearCookies
    )
  }

  if (!canAccessPath(pathname, roles)) {
    return withAuthUpdates(
      NextResponse.redirect(new URL(landingPath, request.url)),
      refreshedTokens,
      shouldClearCookies
    )
  }

  return withAuthUpdates(NextResponse.next(), refreshedTokens, shouldClearCookies)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

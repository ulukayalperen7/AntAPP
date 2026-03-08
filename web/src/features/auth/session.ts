import 'server-only'

import { cookies } from 'next/headers'
import type { AuthUser } from './types'
import { ACCESS_TOKEN_COOKIE } from './constants'
import { decodeJwtPayload, getTokenRoles, isJwtExpired } from './jwt'

export async function getServerSession(): Promise<AuthUser | null> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value
  const payload = decodeJwtPayload(token)
  if (!payload || isJwtExpired(payload)) return null

  return {
    id: String(payload.uid ?? ''),
    userName: String(payload.sub ?? ''),
    email: String(payload.email ?? ''),
    roles: getTokenRoles(payload),
    isVerified: true,
    jwToken: token ?? '',
  }
}

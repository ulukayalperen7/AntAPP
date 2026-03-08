const ROLE_CLAIM_KEYS = [
  'roles',
  'role',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
]

type JwtPayload = Record<string, unknown> & {
  exp?: number
  uid?: string
  sub?: string
  email?: string
}

function base64UrlToBase64(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  return `${base64}${padding}`
}

function decodeBase64(value: string): string {
  if (typeof atob === 'function') {
    return atob(value)
  }
  return Buffer.from(value, 'base64').toString('utf-8')
}

export function decodeJwtPayload(token?: string | null): JwtPayload | null {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const payload = decodeBase64(base64UrlToBase64(parts[1]))
    return JSON.parse(payload) as JwtPayload
  } catch {
    return null
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value]
  }
  return []
}

export function getTokenRoles(payload: JwtPayload | null): string[] {
  if (!payload) return []

  const roles = ROLE_CLAIM_KEYS.flatMap((key) => toStringArray(payload[key]))
  return Array.from(new Set(roles))
}

export function isJwtExpired(payload: JwtPayload | null, skewSeconds = 30): boolean {
  if (!payload || typeof payload.exp !== 'number') return true
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + skewSeconds
}

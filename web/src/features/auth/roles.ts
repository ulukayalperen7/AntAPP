const ADMIN_ROLES = new Set(['Admin'])
const BUSINESS_ROLES = new Set(['BusinessUser', 'Admin'])

export function normalizeRoles(roles: string[]): string[] {
  return roles.map((r) => r.trim()).filter(Boolean)
}

export function canAccessAdmin(roles: string[], username?: string): boolean {
  const normalized = normalizeRoles(roles)
  const hasAdmin = normalized.some((r) => ADMIN_ROLES.has(r))
  // Admin access: either has Admin role OR username is 'antadmin'
  return hasAdmin || username === 'antadmin'
}

export function canAccessBusiness(roles: string[]): boolean {
  return normalizeRoles(roles).some((r) => BUSINESS_ROLES.has(r))
}

export function getLandingPathByRoles(roles: string[], username?: string): string {
  if (canAccessAdmin(roles, username)) return '/admin'
  if (canAccessBusiness(roles)) return '/business'
  return '/dashboard'
}

export function canAccessPath(pathname: string, roles: string[], username?: string): boolean {
  if (pathname.startsWith('/admin')) return canAccessAdmin(roles, username)
  if (pathname.startsWith('/business')) return canAccessBusiness(roles)
  return true
}

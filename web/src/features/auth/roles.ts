const ADMIN_ROLES = new Set(['Admin'])
const BUSINESS_ROLES = new Set(['BusinessUser', 'Admin'])

export function normalizeRoles(roles: string[]): string[] {
  return roles.map((r) => r.trim()).filter(Boolean)
}

export function canAccessAdmin(roles: string[]): boolean {
  return normalizeRoles(roles).some((r) => ADMIN_ROLES.has(r))
}

export function canAccessBusiness(roles: string[]): boolean {
  return normalizeRoles(roles).some((r) => BUSINESS_ROLES.has(r))
}

export function getLandingPathByRoles(roles: string[]): string {
  if (canAccessAdmin(roles)) return '/admin'
  if (canAccessBusiness(roles)) return '/business'
  return '/'
}

export function canAccessPath(pathname: string, roles: string[]): boolean {
  if (pathname.startsWith('/admin')) return canAccessAdmin(roles)
  if (pathname.startsWith('/business')) return canAccessBusiness(roles)
  return true
}

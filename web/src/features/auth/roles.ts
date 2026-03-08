const ADMIN_ROLES = new Set(['Admin', 'SuperAdmin'])
const BUSINESS_ROLES = new Set(['Moderator', 'Admin', 'SuperAdmin'])

function normalizeRoles(roles: string[]): string[] {
  return roles.map((role) => role.trim()).filter(Boolean)
}

export function canAccessAdmin(roles: string[]): boolean {
  return normalizeRoles(roles).some((role) => ADMIN_ROLES.has(role))
}

export function canAccessBusiness(roles: string[]): boolean {
  return normalizeRoles(roles).some((role) => BUSINESS_ROLES.has(role))
}

export function getLandingPathByRoles(roles: string[]): string {
  if (canAccessAdmin(roles)) return '/admin'
  if (canAccessBusiness(roles)) return '/business'
  return '/'
}

export function canAccessPath(pathname: string, roles: string[]): boolean {
  if (pathname.startsWith('/admin')) {
    return canAccessAdmin(roles)
  }
  if (pathname.startsWith('/business')) {
    return canAccessBusiness(roles)
  }
  return true
}

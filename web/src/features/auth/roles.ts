const ADMIN_ROLES = new Set(['Admin', 'SuperAdmin'])
const BUSINESS_ROLES = new Set(['Business', 'Moderator', 'Admin', 'SuperAdmin'])

function toPublicRole(role: string): string {
  if (role === 'Basic') return 'User'
  if (role === 'Moderator') return 'Business'
  if (role === 'SuperAdmin') return 'Admin'
  return role
}

export function normalizeRoles(roles: string[]): string[] {
  return roles
    .map((role) => toPublicRole(role.trim()))
    .filter(Boolean)
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

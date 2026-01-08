import { Role, getSession } from './session'

type Feature =
  | 'dashboard'
  | 'orders'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.delete'
  | 'customers'
  | 'inventory'
  | 'settings'
  | 'reports'
  | 'admin'

const featurePermissions: Record<Feature, Role[]> = {
  dashboard: ['admin', 'staff'],
  orders: ['admin', 'staff'],
  'orders.create': ['admin', 'staff'],
  'orders.edit': ['admin', 'staff'],
  'orders.delete': ['admin'],
  customers: ['admin', 'staff'],
  inventory: ['admin', 'staff'],
  settings: ['admin'],
  reports: ['admin'],
  admin: ['admin'],
}

export function canAccess(feature: Feature, role?: Role): boolean {
  const currentRole = role ?? getSession().role
  const allowedRoles = featurePermissions[feature]
  return allowedRoles.includes(currentRole)
}

export function useCanAccess(feature: Feature): boolean {
  const session = getSession()
  return canAccess(feature, session.role)
}

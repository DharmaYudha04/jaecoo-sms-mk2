import { Role } from '@/common/types/domain';

export type Permission =
  | 'dashboard:view'
  | 'work-orders:view'
  | 'work-orders:create'
  | 'work-orders:edit'
  | 'work-orders:delete'
  | 'services:view'
  | 'services:update'
  | 'services:delete'
  | 'users:view'
  | 'users:update'
  | 'users:delete'
  | 'notifications:view'
  | 'broadcasts:view'
  | 'audit:view';

const ADMIN_MANAGER_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'work-orders:view',
  'work-orders:create',
  'work-orders:edit',
  'work-orders:delete',
  'services:view',
  'services:update',
  'services:delete',
  'users:view',
  'users:update',
  'users:delete',
  'notifications:view',
  'broadcasts:view',
  'audit:view',
];

export const roleLabels: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manajer',
  FRONTLINE: 'Frontliner',
  MEKANIK: 'Mekanik',
};

export const roleDescriptions: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manajer',
  FRONTLINE: 'Frontliner',
  MEKANIK: 'Mekanik',
};

export const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ADMIN_MANAGER_PERMISSIONS,
  MANAGER: ADMIN_MANAGER_PERMISSIONS,
  FRONTLINE: [
    'dashboard:view',
    'work-orders:view',
    'work-orders:create',
    'work-orders:edit',
    'services:view',
    'services:update',
    'notifications:view',
    'broadcasts:view',
  ],
  MEKANIK: [
    'dashboard:view',
    'work-orders:view',
    'services:view',
    'services:update',
    'notifications:view',
    'broadcasts:view',
  ],
};

const routePermissionMatchers: Array<{ pattern: RegExp; permission: Permission }> = [
  { pattern: /^\/users(\/|$)/, permission: 'users:view' },
  { pattern: /^\/notifications(\/|$)/, permission: 'notifications:view' },
  { pattern: /^\/broadcasts(\/|$)/, permission: 'broadcasts:view' },
  { pattern: /^\/work-orders\/new(\/|$)/, permission: 'work-orders:create' },
  { pattern: /^\/work-orders\/\d+\/edit(\/|$)/, permission: 'work-orders:edit' },
  { pattern: /^\/work-orders(\/|$)/, permission: 'work-orders:view' },
  { pattern: /^\/services(\/|$)/, permission: 'services:view' },
  { pattern: /^\/audit(\/|$)/, permission: 'audit:view' },
  { pattern: /^\/dashboard(\/|$)/, permission: 'dashboard:view' },
];

export function hasPermission(role: Role | null | undefined, permission: Permission) {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
}

export function getRequiredPermissionForPath(pathname: string) {
  return routePermissionMatchers.find((item) => item.pattern.test(pathname))?.permission ?? null;
}

export function canAccessPath(role: Role | null | undefined, pathname: string) {
  const requiredPermission = getRequiredPermissionForPath(pathname);
  if (!requiredPermission) return true;
  return hasPermission(role, requiredPermission);
}

export function getDefaultRouteByRole(_role: Role | null | undefined) {
  return '/dashboard';
}

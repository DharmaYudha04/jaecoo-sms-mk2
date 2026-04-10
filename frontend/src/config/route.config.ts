import { Permission } from '@/common/lib/authz';

export type AppNavItem = {
  path: string;
  label: string;
  permission: Permission;
  description: string;
};

export const appRoutes: AppNavItem[] = [
  { path: '/dashboard', label: 'Dashboard', permission: 'dashboard:view', description: '' },
  { path: '/notifications', label: 'Notifikasi', permission: 'notifications:view', description: '' },
  { path: '/broadcasts', label: 'Broadcast', permission: 'broadcasts:view', description: '' },
  { path: '/work-orders', label: 'Work Order', permission: 'work-orders:view', description: '' },
  { path: '/services', label: 'Servis', permission: 'services:view', description: '' },
  { path: '/users', label: 'Pegawai', permission: 'users:view', description: '' },
  { path: '/audit', label: 'Riwayat Aktivitas', permission: 'audit:view', description: '' },
];

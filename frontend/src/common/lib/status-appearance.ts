import { ServiceStatus } from '@/common/types/domain';

export const serviceStatusLabelMap: Record<ServiceStatus, string> = {
  ANTRIAN: 'ANTRIAN',
  DIKERJAKAN: 'PROSES SERVIS',
  TEST_DRIVE: 'SIAP TEST DRIVE',
  SELESAI: 'SELESAI',
  DIAMBIL: 'DIAMBIL',
  TERKENDALA: 'TERKENDALA',
};

export const serviceStatusBadgeMap: Record<ServiceStatus, string> = {
  ANTRIAN: 'status-badge status-badge--antrian',
  DIKERJAKAN: 'status-badge status-badge--dikerjakan',
  TEST_DRIVE: 'status-badge status-badge--test-drive',
  SELESAI: 'status-badge status-badge--selesai',
  DIAMBIL: 'status-badge status-badge--diambil',
  TERKENDALA: 'status-badge status-badge--terkendala',
};

export const serviceStatusPanelMap: Record<ServiceStatus, string> = {
  ANTRIAN: 'status-panel status-panel--antrian',
  DIKERJAKAN: 'status-panel status-panel--dikerjakan',
  TEST_DRIVE: 'status-panel status-panel--test-drive',
  SELESAI: 'status-panel status-panel--selesai',
  DIAMBIL: 'status-panel status-panel--diambil',
  TERKENDALA: 'status-panel status-panel--terkendala',
};

export const serviceStatusGlowMap: Record<ServiceStatus, string> = {
  ANTRIAN: 'shadow-[0_18px_36px_rgba(49,82,207,0.18)] dark:shadow-[0_22px_44px_rgba(7,18,45,0.34)]',
  DIKERJAKAN: 'shadow-[0_18px_36px_rgba(63,115,173,0.18)] dark:shadow-[0_22px_44px_rgba(8,20,44,0.34)]',
  TEST_DRIVE: 'shadow-[0_18px_36px_rgba(108,53,214,0.18)] dark:shadow-[0_22px_44px_rgba(18,8,44,0.34)]',
  SELESAI: 'shadow-[0_18px_36px_rgba(77,144,72,0.18)] dark:shadow-[0_22px_44px_rgba(10,30,20,0.34)]',
  DIAMBIL: 'shadow-[0_18px_36px_rgba(77,156,148,0.18)] dark:shadow-[0_22px_44px_rgba(8,26,26,0.34)]',
  TERKENDALA: 'shadow-[0_18px_36px_rgba(197,42,77,0.16)] dark:shadow-[0_22px_44px_rgba(42,8,18,0.34)]',
};

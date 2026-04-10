import { Role, ServiceStatus } from '@/common/types/domain';
import { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';

function makeBaseConfig(role: Role, eyebrow: string, heading: string): DashboardConfig {
  return {
    role,
    eyebrow,
    heading,
    heroImage: '/assets/img11.jpeg',
    focusCards: [],
    monitoringCards: [],
    kpis: [],
    statusCounts: { ANTRIAN: 0, DIKERJAKAN: 0, TEST_DRIVE: 0, SELESAI: 0, DIAMBIL: 0, TERKENDALA: 0 },
    timeline: [],
    activeList: [],
    priorityList: [],
  };
}

const roleDashboardMap: Record<Role | 'default', DashboardConfig> = {
  ADMIN: makeBaseConfig('ADMIN', 'Admin', 'Overview Operasional'),
  MANAGER: makeBaseConfig('MANAGER', 'Manajer', 'Monitoring Operasional'),
  FRONTLINE: makeBaseConfig('FRONTLINE', 'Frontliner', 'Intake & Frontdesk'),
  MEKANIK: makeBaseConfig('MEKANIK', 'Mekanik', 'Workshop Progress'),
  default: makeBaseConfig('ADMIN', 'Admin', 'Overview Operasional'),
};

export const dashboardOrderedStatuses: ServiceStatus[] = ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA'];

export function getDashboardConfigByRole(role?: Role | null) {
  return structuredClone(roleDashboardMap[role ?? 'default'] ?? roleDashboardMap.default);
}

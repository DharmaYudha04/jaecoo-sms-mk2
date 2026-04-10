import { Role, ServiceStatus } from '@/common/types/domain';
import type { dashboardTone } from '@/modules/dashboard/lib/dashboard-tone';

export type DashboardToneKey = keyof typeof dashboardTone;

export type DashboardKpiCard = { label: string; value: string; tone: DashboardToneKey; chip?: string; href: string };
export type DashboardFocusCard = { label: string; value: string; chip?: string; tone: DashboardToneKey; href: string };
export type DashboardWorkOrderItem = { wo: string; plate: string; model: string; status: ServiceStatus; time: string; href: string; isNew?: boolean };
export type DashboardTimelineItem = { time: string; text: string; status: ServiceStatus };
export type DashboardPriorityItem = { title: string; status: ServiceStatus; note: string; href: string };
export type DashboardMonitoringCard = { label: string; value: string; note: string; tone: DashboardToneKey; href: string; unseenSection?: 'work-orders' | 'services'; unseenStatus?: ServiceStatus };

export type DashboardConfig = {
  eyebrow: string;
  heading: string;
  role?: Role;
  heroImage: string;
  focusCards: DashboardFocusCard[];
  kpis: DashboardKpiCard[];
  monitoringCards?: DashboardMonitoringCard[];
  statusCounts: Record<ServiceStatus, number>;
  timeline: DashboardTimelineItem[];
  activeList: DashboardWorkOrderItem[];
  priorityList: DashboardPriorityItem[];
};

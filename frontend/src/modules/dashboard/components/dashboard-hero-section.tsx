
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { getUnseenServiceStatusCounts, getValidUnseenCount } from '@/common/lib/unseen-notifications';
import { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';
import { dashboardTone } from '@/modules/dashboard/lib/dashboard-tone';
import { cn } from '@/common/utils/cn';
import { getPreferredDisplayName } from '@/common/lib/display-name';
import type { Service, WorkOrder } from '@/common/types/domain';
import { DashboardBroadcastCard } from '@/modules/dashboard/components/dashboard-broadcast-card';

export function DashboardHeroSection({ config, services, workOrders }: { config: DashboardConfig; services: Service[]; workOrders: WorkOrder[] }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const currentUser = useAuthStore((state) => state.user);
  const monitoringCards = config.monitoringCards ?? [];
  useUnseenRefresh();
  const workOrderBadgeCount = getValidUnseenCount(role, 'work-orders', workOrders.map((item) => item.id_wo));
  const serviceBadgeCount = getValidUnseenCount(role, 'services', services.map((item) => item.id_wo));
  const serviceStatusBadgeCounts = useMemo(() => getUnseenServiceStatusCounts(role, services), [role, services]);
  const displayName = getPreferredDisplayName(currentUser);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
      <Card className="dashboard-surface overflow-hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">{config.eyebrow}</p>
          <p className="mt-3 text-lg font-semibold theme-text">Halo, {displayName}</p>
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="section-title">{config.heading}</h2>
            <p className="dashboard-support-copy max-w-2xl text-sm leading-6">
              Ringkasan kondisi operasional dan akses cepat sesuai tugas Anda.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {monitoringCards.map((item) => {
              const tone = dashboardTone[item.tone] ?? dashboardTone.info;
              const badgeCount = item.unseenSection === 'work-orders'
                ? workOrderBadgeCount
                : item.unseenStatus
                  ? serviceStatusBadgeCounts[item.unseenStatus]
                  : item.unseenSection === 'services'
                    ? serviceBadgeCount
                    : 0;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'dashboard-interactive-card flex min-h-[176px] flex-col justify-between rounded-[24px] border p-4 text-left md:min-h-[184px] md:p-6',
                    tone.panel,
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className={cn('text-sm font-medium leading-6 md:text-base', tone.title)}>{item.label}</p>
                      <div className="flex items-center gap-2">
                        {badgeCount > 0 ? <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_0_0_4px_rgba(239,68,68,0.18)]">{badgeCount}</span> : null}
                        <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold md:text-xs', tone.chip)}>
                          Live
                        </span>
                      </div>
                    </div>
                    <p className={cn('text-4xl font-semibold leading-none tracking-tight md:text-5xl', tone.value)}>{item.value}</p>
                  </div>
                  <p className={cn('text-xs leading-5 md:text-sm md:leading-6', tone.note)}>{item.note}</p>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <DashboardBroadcastCard />
    </section>
  );
}

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { getUnseenServiceStatusCounts, getValidUnseenCount } from '@/common/lib/unseen-notifications';
import { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';
import { dashboardTone } from '@/modules/dashboard/lib/dashboard-tone';
import { cn } from '@/common/utils/cn';
import type { Service, WorkOrder } from '@/common/types/domain';

export function DashboardHeroSection({ config, services, workOrders }: { config: DashboardConfig; services: Service[]; workOrders: WorkOrder[] }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const monitoringCards = config.monitoringCards ?? [];
  useUnseenRefresh();
  const workOrderBadgeCount = getValidUnseenCount(role, 'work-orders', workOrders.map((item) => item.id_wo));
  const serviceBadgeCount = getValidUnseenCount(role, 'services', services.map((item) => item.id_wo));
  const serviceStatusBadgeCounts = useMemo(() => getUnseenServiceStatusCounts(role, services), [role, services]);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
      <Card className="dashboard-surface overflow-hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">{config.eyebrow}</p>
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="section-title">{config.heading}</h2>
            <p className="dashboard-support-copy max-w-2xl text-sm leading-6">
              Tampilan ringkasan cepat untuk memantau kondisi operasional.
            </p>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
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
                    'dashboard-interactive-card flex min-h-[184px] flex-col justify-between rounded-[24px] border p-5 text-left md:p-6',
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
                  <p className={cn('text-sm leading-6', tone.note)}>{item.note}</p>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="dashboard-surface overflow-hidden p-0">
        <button
          type="button"
          onClick={() => navigate('/services')}
          className="dashboard-interactive-card block h-full w-full rounded-[28px] p-0 focus-visible:outline-none"
        >
          <img src={config.heroImage} alt="JAECOO" className="h-full min-h-[300px] w-full rounded-xl object-cover transition duration-700 hover:scale-[1.02]" />
        </button>
      </Card>
    </section>
  );
}

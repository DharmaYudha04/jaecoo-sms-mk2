
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { serviceStatusGlowMap, serviceStatusLabelMap, serviceStatusPanelMap } from '@/common/lib/status-appearance';
import { getUnseenServiceStatusCounts } from '@/common/lib/unseen-notifications';
import { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';
import { dashboardOrderedStatuses } from '@/modules/dashboard/lib/dashboard-config-role';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';
import type { Service } from '@/common/types/domain';

export function DashboardStatusOverview({ config, services }: { config: DashboardConfig; services: Service[] }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  useUnseenRefresh();
  const unseenStatusCounts = useMemo(() => getUnseenServiceStatusCounts(role, services), [role, services]);

  return (
    <section>
      <Card className="dashboard-surface">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">Status</p>
          <h3 className="mt-3 text-xl font-semibold theme-text">Snapshot Status Kendaraan</h3>
          <p className="mt-2 text-sm leading-6 theme-muted">
            Ringkasan jumlah unit berdasarkan enam status operasional utama.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-3">
          {dashboardOrderedStatuses.map((status, index) => {
            const isLastOddMobileCard = dashboardOrderedStatuses.length % 2 !== 0 && index == dashboardOrderedStatuses.length - 1;

            return (
            <button
              type="button"
              onClick={() => navigate(`/services/status/${status}`)}
              key={status}
              className={`dashboard-status-card dashboard-interactive-card min-h-[164px] rounded-[24px] border p-4 text-left sm:min-h-[172px] sm:p-5 ${serviceStatusPanelMap[status]} ${serviceStatusGlowMap[status]} ${isLastOddMobileCard ? 'col-span-2 xl:col-span-1' : ''}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold leading-6 text-white sm:text-base">{serviceStatusLabelMap[status]}</p>
                  {unseenStatusCounts[status] > 0 ? <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_0_0_4px_rgba(239,68,68,0.18)]">{unseenStatusCounts[status]}</span> : null}
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-6 flex items-end justify-between gap-3">
                <p className="text-[2rem] font-semibold tracking-tight text-white sm:text-[2.15rem]">{config.statusCounts[status]}</p>
                <p className="dashboard-status-card-copy text-xs leading-5 text-white/88">Lihat daftar unit dengan status ini</p>
              </div>
            </button>
          );})}
        </div>
      </Card>
    </section>
  );
}

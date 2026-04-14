
import { useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { getValidUnseenCount } from '@/common/lib/unseen-notifications';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';

function getSectionTitle(role?: DashboardConfig['role']) {
  if (role === 'MEKANIK') return 'Daftar Unit Bengkel';
  if (role === 'FRONTLINE') return 'Daftar Tindak Lanjut';
  return 'Daftar Unit Aktif';
}

function getSectionCopy(role?: DashboardConfig['role']) {
  if (role === 'MEKANIK') return 'Maksimal 20 unit terbaru untuk memantau pekerjaan yang sedang berjalan.';
  if (role === 'FRONTLINE') return 'Maksimal 20 unit terbaru yang perlu dipantau dari meja depan.';
  return 'Maksimal 20 unit terbaru untuk pemantauan harian bengkel.';
}

export function DashboardWorkOrderSection({ config, workOrderIds }: { config: DashboardConfig; workOrderIds: number[] }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  useUnseenRefresh();
  const workOrderBadgeCount = getValidUnseenCount(role, 'work-orders', workOrderIds);

  return (
    <section>
      <Card className="dashboard-surface">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">Work Order</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold theme-text">{getSectionTitle(config.role)}</h3>
            {workOrderBadgeCount > 0 ? <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_0_0_4px_rgba(239,68,68,0.18)]">{workOrderBadgeCount}</span> : null}
          </div>
          <p className="mt-2 text-sm leading-6 theme-muted">{getSectionCopy(config.role)}</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-[color:var(--line)]">
          <div className="hidden grid-cols-[1.15fr_1fr_1.2fr_0.8fr] gap-3 border-b border-[color:var(--line)] dashboard-list-header px-4 py-3 text-xs uppercase tracking-[0.18em] theme-muted md:grid">
            <span>WO</span>
            <span>Kendaraan</span>
            <span>Status</span>
            <span>Masuk</span>
          </div>
          <div className="divide-y divide-[color:var(--line)]">
            {config.activeList.length === 0 ? <div className="p-6"><EmptyState message="Belum ada work order aktif untuk ditampilkan." /></div> : null}
            {config.activeList.map((item) => (
              <button type="button" key={item.wo} onClick={() => navigate(item.href)} className="dashboard-list-row w-full px-4 py-4 text-left text-sm theme-text">
                <div className="space-y-3 md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.wo}</p>
                        {item.isNew ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.18)]" aria-label="Baru" /> : null}
                      </div>
                      <p className="mt-1 text-xs theme-muted">{item.plate}</p>
                    </div>
                    <span className="text-xs theme-muted">{item.time}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-light)] px-2.5 py-1 text-xs theme-muted">{item.model}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="hidden grid-cols-[1.15fr_1fr_1.2fr_0.8fr] gap-3 md:grid">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{item.wo}</p>
                      {item.isNew ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.18)]" aria-label="Baru" /> : null}
                    </div>
                    <p className="mt-1 text-xs theme-muted">{item.plate}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{item.model}</p>
                  </div>
                  <div className="flex items-center">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="text-sm theme-text">{item.time}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}

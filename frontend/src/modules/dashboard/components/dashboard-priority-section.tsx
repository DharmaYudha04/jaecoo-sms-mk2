import { useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { EmptyState } from '@/common/components/feedback/empty-state';
import type { DashboardConfig, DashboardPriorityItem } from '@/modules/dashboard/types/dashboard.types';
import { serviceStatusLabelMap } from '@/common/lib/status-appearance';
import { cn } from '@/common/utils/cn';

const priorityToneMap = {
  ANTRIAN:
    'dashboard-premium-card dashboard-premium-card--status-blue border-sky-300/55 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,rgba(111,152,244,0.28),rgba(49,92,214,0.22))] text-slate-900 dark:border-sky-400/18 dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(14,28,64,0.96),rgba(3,12,34,0.98))] dark:text-white',
  DIKERJAKAN:
    'dashboard-premium-card dashboard-premium-card--status-cyan border-sky-300/55 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,rgba(126,169,218,0.28),rgba(63,115,173,0.22))] text-slate-900 dark:border-sky-400/18 dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(17,35,64,0.96),rgba(6,20,38,0.98))] dark:text-white',
  TEST_DRIVE:
    'dashboard-premium-card dashboard-premium-card--status-purple border-violet-300/55 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,rgba(169,120,255,0.24),rgba(108,53,214,0.2))] text-slate-900 dark:border-violet-400/18 dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(28,18,64,0.96),rgba(14,8,34,0.98))] dark:text-white',
  SELESAI:
    'dashboard-premium-card dashboard-premium-card--status-green border-emerald-300/55 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,rgba(130,196,129,0.24),rgba(77,144,72,0.2))] text-slate-900 dark:border-emerald-400/18 dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(17,45,34,0.96),rgba(8,23,18,0.98))] dark:text-white',
  DIAMBIL:
    'dashboard-premium-card dashboard-premium-card--status-teal border-teal-300/55 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,rgba(133,204,195,0.24),rgba(77,156,148,0.2))] text-slate-900 dark:border-teal-400/18 dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(14,44,42,0.96),rgba(6,21,22,0.98))] dark:text-white',
  TERKENDALA:
    'dashboard-premium-card dashboard-premium-card--status-red border-rose-300/55 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,rgba(245,118,142,0.24),rgba(197,42,77,0.2))] text-slate-900 dark:border-rose-400/18 dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(54,14,28,0.96),rgba(28,6,14,0.98))] dark:text-white',
} as const;

function getPriorityHeading(role?: DashboardConfig['role']) {
  if (role === 'MEKANIK') return 'Perlu Tindakan Bengkel';
  if (role === 'FRONTLINE') return 'Perlu Tindak Lanjut';
  return 'Perlu Perhatian';
}

function getPriorityCopy(role?: DashboardConfig['role']) {
  if (role === 'MEKANIK') return 'Unit yang menunggu pengerjaan, siap QC, atau sedang terkendala.';
  if (role === 'FRONTLINE') return 'Unit yang perlu diteruskan, dikonfirmasi, atau disiapkan untuk pelanggan.';
  return 'Lihat unit yang tertahan, siap QC, atau belum selesai ditangani.';
}

function PriorityItemCard({ item }: { item: DashboardPriorityItem }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(item.href)}
      className={cn(
        'dashboard-interactive-card group flex h-full w-full min-h-[210px] flex-col rounded-[26px] border p-4 text-left transition duration-300 sm:p-5',
        priorityToneMap[item.status],
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-inherit md:text-xl">{item.title}</p>
          <p className="mt-2 text-sm leading-6 text-inherit/78 dark:text-white/78">{item.note}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-inherit/68 dark:text-white/70">
          {serviceStatusLabelMap[item.status]}
        </span>
        <span className="text-sm font-semibold text-inherit transition duration-300 group-hover:translate-x-0.5">Buka</span>
      </div>
    </button>
  );
}

export function DashboardPrioritySection({ config }: { config: DashboardConfig }) {
  return (
    <section>
      <Card className="dashboard-surface">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">Prioritas</p>
          <h3 className="mt-3 text-xl font-semibold theme-text">{getPriorityHeading(config.role)}</h3>
          <p className="mt-2 text-sm leading-6 theme-muted">{getPriorityCopy(config.role)}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
          {config.priorityList.length === 0 ? (
            <div className="col-span-2 rounded-[24px] border border-[color:var(--line)] p-6">
              <EmptyState message="Tidak ada unit prioritas untuk ditampilkan." />
            </div>
          ) : null}
          {config.priorityList.map((item) => (
            <PriorityItemCard key={`${item.title}-${item.status}-${item.href}`} item={item} />
          ))}
        </div>
      </Card>
    </section>
  );
}

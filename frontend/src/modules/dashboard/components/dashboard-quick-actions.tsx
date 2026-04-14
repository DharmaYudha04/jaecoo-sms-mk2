import { useNavigate } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import type { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';
import { cn } from '@/common/utils/cn';

const toneByLabel: Record<string, string> = {
  'Work Order': 'dashboard-quick-access-card--work-order',
  'Board Servis': 'dashboard-quick-access-card--board',
  Notifikasi: 'dashboard-quick-access-card--notification',
  Broadcast: 'dashboard-quick-access-card--broadcast',
};

export function DashboardQuickActions({ config }: { config: DashboardConfig }) {
  const navigate = useNavigate();
  const items = config.quickActions ?? [];

  if (items.length === 0) return null;

  return (
    <section>
      <Card className="dashboard-surface">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] theme-muted">Akses Cepat</p>
            <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] theme-text">Empat laman utama yang paling sering dipakai</h3>
            <p className="mt-2 text-sm leading-6 theme-muted">
              Akses cepat ke menu inti yang paling sering dipakai.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {items.map((item) => (
            <button
              key={`${item.href}-${item.label}`}
              type="button"
              onClick={() => navigate(item.href)}
              className={cn(
                'dashboard-quick-access-card dashboard-interactive-card group relative min-w-0 overflow-hidden rounded-[26px] border px-4 py-4 text-left transition duration-300 md:px-5 md:py-5',
                toneByLabel[item.label] ?? 'dashboard-quick-access-card--neutral',
              )}
            >
              <div className="flex min-h-[126px] flex-col justify-between gap-5 md:min-h-[138px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <p className="dashboard-quick-access-title truncate text-[1.08rem] font-semibold tracking-[-0.03em] md:text-[1.16rem]">
                      {item.label}
                    </p>
                    <p className="dashboard-quick-access-note mt-2 line-clamp-2 text-[13px] leading-6 md:text-[14px]">
                      {item.note}
                    </p>
                  </div>
                  {typeof item.badgeCount === 'number' && item.badgeCount > 0 ? (
                    <span className="dashboard-quick-access-badge inline-flex min-w-[28px] shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em]">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="dashboard-quick-access-meta text-[11px] font-semibold uppercase tracking-[0.22em] transition duration-300">
                    Shortcut
                  </span>
                  <span className="dashboard-quick-access-action text-sm font-semibold tracking-[-0.01em] transition duration-300 group-hover:translate-x-0.5">
                    Buka
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
}

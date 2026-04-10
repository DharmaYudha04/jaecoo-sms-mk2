import { useNavigate } from 'react-router-dom';
import { DashboardKpiCard } from '@/modules/dashboard/types/dashboard.types';
import { dashboardTone } from '@/modules/dashboard/lib/dashboard-tone';
import { cn } from '@/common/utils/cn';

export function DashboardKpiCardView({ card }: { card: DashboardKpiCard }) {
  const navigate = useNavigate();
  const tone = dashboardTone[card.tone] ?? dashboardTone.info;

  return (
    <button
      type="button"
      onClick={() => navigate(card.href)}
      className={cn(
        'dashboard-interactive-card w-full rounded-[30px] border border-[color:var(--line)] p-4 text-left md:p-5',
        tone.panel,
      )}
    >
      <div className="space-y-4">
        <p className={cn('text-xl leading-[1.02] font-medium tracking-tight md:text-[30px]', tone.title)}>{card.label}</p>
        {card.chip ? (
          <div className={cn('inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-none md:text-sm', tone.chip)}>
            {card.chip}
          </div>
        ) : null}
        <p className={cn('text-[42px] leading-none font-semibold tracking-tight md:text-[52px]', tone.value)}>{card.value}</p>
      </div>
    </button>
  );
}

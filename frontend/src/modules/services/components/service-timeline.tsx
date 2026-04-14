import { ServiceHistory } from '@/common/types/domain';
import { StatusBadge } from '@/common/components/data-display/status-badge';

export function ServiceTimeline({ items }: { items: ServiceHistory[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => {
        const time = new Date(item.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(item.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        return (
          <li key={item.id_riwayat} className="relative pl-0">
            <div className="grid grid-cols-[88px_1fr] gap-3 md:grid-cols-[104px_1fr]">
              <div className="relative flex min-h-[88px] items-center justify-center rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel-light)] px-3 text-center">
                <span className="absolute right-[-8px] top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-[#e0c48e] shadow-[0_0_0_6px_rgba(224,196,142,0.12)] md:block" />
                <div>
                  <p className="text-base font-semibold theme-text">{time}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] theme-muted">{date}</p>
                </div>
              </div>
              <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold theme-text">{item.status.replace('_', ' ')}</p>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </div>
            {index !== items.length - 1 && <div className="ml-[43px] mt-2 h-5 w-px bg-[color:var(--line)] md:ml-[51px]" />}
          </li>
        );
      })}
    </ol>
  );
}

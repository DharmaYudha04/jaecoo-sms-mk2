import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { Service, ServiceStatus } from '@/common/types/domain';
import { serviceStatusGlowMap, serviceStatusLabelMap, serviceStatusPanelMap } from '@/common/lib/status-appearance';

const columns: ServiceStatus[] = ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA'];

export function ServiceBoard({ services, baseSearch = '' }: { services: Service[]; baseSearch?: string }) {
  const unseenCounts = useMemo(() => ({ ANTRIAN: 0, DIKERJAKAN: 0, TEST_DRIVE: 0, SELESAI: 0, DIAMBIL: 0, TERKENDALA: 0 }), []);

  return (
    <div className="pb-2">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {columns.map((status) => {
          const count = services.filter((item) => item.status === status).length;
          const href = `/services/status/${status}${baseSearch ? `?search=${encodeURIComponent(baseSearch)}` : ''}`;
          return (
            <Link
              key={status}
              to={href}
              className={`dashboard-status-card dashboard-interactive-card min-h-[172px] rounded-[24px] border p-5 text-left ${serviceStatusPanelMap[status]} ${serviceStatusGlowMap[status]}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold leading-6 text-white">{serviceStatusLabelMap[status]}</p>
                  {unseenCounts[status] > 0 ? <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_0_0_4px_rgba(239,68,68,0.18)]">{unseenCounts[status]}</span> : null}
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-6 flex items-end justify-between gap-3">
                <p className="text-[2.15rem] font-semibold tracking-tight text-white">{count}</p>
                <div className="dashboard-status-card-copy text-right text-xs leading-5 text-white/88">
                  <p>Klik untuk melihat</p>
                  <p>daftar status ini</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

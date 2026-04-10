import { Link } from 'react-router-dom';
import { Service } from '@/common/types/domain';
import { Card } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { formatWorkOrderCode } from '@/common/lib/work-order-code';
import { Button } from '@/common/components/ui/button';
import { serviceStatusGlowMap, serviceStatusPanelMap } from '@/common/lib/status-appearance';

const priorityMap = {
  NORMAL: 'priority-text--normal',
  HIGH: 'priority-text--high',
  URGENT: 'priority-text--urgent',
} as const;

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className={`space-y-3 rounded-[24px] border p-4 ${serviceStatusPanelMap[service.status]} ${serviceStatusGlowMap[service.status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] theme-muted">Servis #{service.id_servis}</p>
          <h3 className="mt-2 text-sm font-semibold leading-6 theme-text">{service.keluhan}</h3>
        </div>
        <StatusBadge status={service.status} />
      </div>
      <div className="flex items-center justify-between text-xs theme-muted">
        <span className={priorityMap[service.prioritas]}>Prioritas {service.prioritas}</span>
        <span>{formatWorkOrderCode({ id_wo: service.id_wo })}</span>
      </div>
      <div className="action-strip pt-1">
        <Link to={`/services/${service.id_servis}`}><Button variant="secondary" type="button">Detail</Button></Link>
        <Button variant="secondary" type="button">Edit</Button>
        <Button variant="danger" type="button">Hapus</Button>
      </div>
    </Card>
  );
}

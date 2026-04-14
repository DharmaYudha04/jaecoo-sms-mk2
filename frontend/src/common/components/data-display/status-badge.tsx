import { Badge } from '@/common/components/ui/badge';
import { ServiceStatus } from '@/common/types/domain';
import { serviceStatusBadgeMap, serviceStatusLabelMap } from '@/common/lib/status-appearance';

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return <Badge className={serviceStatusBadgeMap[status]}>{serviceStatusLabelMap[status]}</Badge>;
}

import { isBackendWorkOrderStatus } from '@/common/lib/backend-contract';
import type { WorkOrder } from '@/common/types/domain';
import { formatWorkOrderCode } from '@/common/lib/work-order-code';
import type { BackendWorkOrder } from '@/modules/work-orders/types/work-order.api';
import type { WorkOrderListRow, WorkOrderSummaryCard } from '@/modules/work-orders/types/work-order.types';

export function mapWorkOrderFromApi(input: BackendWorkOrder): WorkOrder {
  return {
    id_wo: Number(input.id_wo ?? 0),
    nomor_wo_pusat: input.nomor_wo_pusat ? String(input.nomor_wo_pusat) : null,
    waktuMasuk: String(input.waktuMasuk ?? ''),
    status: isBackendWorkOrderStatus(input.status) ? input.status : 'OPEN',
    no_rangka: String(input.no_rangka ?? ''),
  };
}

export function mapWorkOrderToListRow(input: WorkOrder): WorkOrderListRow {
  return {
    code: formatWorkOrderCode(input),
    unit: input.no_rangka || '-',
    owner: 'Terhubung ke data pelanggan',
    status: input.status,
  };
}

export function buildWorkOrderSummaryCards(items: WorkOrder[]): WorkOrderSummaryCard[] {
  const activeCount = items.filter((item) => item.status === 'OPEN' || item.status === 'IN_PROGRESS').length;
  const closedCount = items.filter((item) => item.status === 'CLOSED').length;
  const cancelledCount = items.filter((item) => item.status === 'CANCELLED').length;

  return [
    { label: 'WO Aktif', value: String(activeCount), note: 'Sedang berjalan' },
    { label: 'WO Ditutup', value: String(closedCount), note: 'Sudah ditutup' },
    { label: 'WO Dibatalkan', value: String(cancelledCount), note: 'Perlu review admin' },
  ];
}

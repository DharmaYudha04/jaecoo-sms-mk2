import type { WorkOrder } from '@/common/types/domain';

export function formatWorkOrderCode(workOrder?: Pick<WorkOrder, 'id_wo'> & { nomor_wo_pusat?: string | null }) {
  const official = workOrder?.nomor_wo_pusat?.trim();
  if (official) return official;
  const rawId = workOrder?.id_wo;
  if (!rawId) return 'WO belum terhubung';
  return `GW-DSP-${String(rawId).slice(-8).padStart(8, '0')}`;
}

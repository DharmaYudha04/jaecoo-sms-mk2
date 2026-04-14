import { unwrapApiCollection } from '@/common/lib/api-response';
import { filterDismissedItems, clearDismissedItems } from '@/common/lib/dismissed-items';
import type { Role } from '@/common/types/domain';
import { apiClient } from '@/services/api-client';
import { endpoints } from '@/services/endpoints';
import type { ActivityLog, ActivityLogFilters } from '@/modules/audit/types/audit.types';

function coerceRole(value: unknown): Role | null {
  if (value === 'ADMIN' || value === 'MANAGER' || value === 'FRONTLINE' || value === 'MEKANIK') {
    return value;
  }
  return null;
}

function mapActivityLogFromBackend(input: Record<string, unknown>): ActivityLog {
  return {
    id: Number(input.id ?? 0),
    createdAt: String(input.createdAt ?? ''),
    actorUserId: input.actorUserId == null ? null : Number(input.actorUserId),
    actorEmail: input.actorEmail == null ? null : String(input.actorEmail),
    actorRole: coerceRole(input.actorRole),
    action: String(input.action ?? ''),
    module: String(input.module ?? ''),
    entityType: input.entityType == null ? null : String(input.entityType),
    entityId: input.entityId == null ? null : String(input.entityId),
    entityLabel: input.entityLabel == null ? null : String(input.entityLabel),
    status: input.status === 'FAILED' ? 'FAILED' : 'SUCCESS',
    message: input.message == null ? null : String(input.message),
    metadata:
      input.metadata && typeof input.metadata === 'object' && !Array.isArray(input.metadata)
        ? (input.metadata as Record<string, unknown>)
        : null,
    ipAddress: input.ipAddress == null ? null : String(input.ipAddress),
    userAgent: input.userAgent == null ? null : String(input.userAgent),
  };
}

export async function getActivityLogs(filters: ActivityLogFilters = {}): Promise<ActivityLog[]> {
  const { data } = await apiClient.get<Record<string, unknown>[] | { data?: Record<string, unknown>[] }>(endpoints.auditLogs.list, {
    params: {
      search: filters.search || undefined,
      module: filters.module || undefined,
      actorRole: filters.actorRole || undefined,
      status: filters.status || undefined,
      actorEmail: filters.actorEmail?.trim() || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      limit: filters.limit ?? 120,
    },
  });

  return filterDismissedItems('activity-logs', unwrapApiCollection(data).map((item) => mapActivityLogFromBackend(item as Record<string, unknown>)));
}

export async function clearActivityLogs() {
  await apiClient.delete(endpoints.auditLogs.clearAll);
  clearDismissedItems('activity-logs');
}

import type { Role } from '@/common/types/domain';

export type AuditLogStatus = 'SUCCESS' | 'FAILED';

export interface ActivityLog {
  id: number;
  createdAt: string;
  actorUserId?: number | null;
  actorEmail?: string | null;
  actorRole?: Role | null;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: string | null;
  entityLabel?: string | null;
  status: AuditLogStatus;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export type ActivityLogFilters = {
  search?: string;
  module?: string;
  actorRole?: Role | '';
  status?: AuditLogStatus | '';
  actorEmail?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
};

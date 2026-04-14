export const queryKeys = {
  auth: ['auth'] as const,
  dashboard: ['dashboard'] as const,
  customers: ['customers'] as const,
  customerDetail: (nik: string) => ['customers', nik] as const,
  vehicles: ['vehicles'] as const,
  vehicleDetail: (id: string) => ['vehicles', id] as const,
  workOrders: ['work-orders'] as const,
  workOrderDetail: (id: string | number) => ['work-orders', id] as const,
  services: ['services'] as const,
  serviceDetail: (id: string | number) => ['services', id] as const,
  users: ['users'] as const,
  notifications: (filters?: { search?: string; status?: string; sort?: string }) => ['notifications', filters ?? {}] as const,
  notificationsUnreadCount: ['notifications', 'unread-count'] as const,
  broadcasts: (filters?: { search?: string; status?: string; sort?: string }) => ['broadcasts', filters ?? {}] as const,
  broadcastsUnreadCount: ['broadcasts', 'unread-count'] as const,
  auditLogs: (filters: AuditLogFilterKey) => ['audit-logs', filters] as const,
};

export type AuditLogFilterKey = {
  search?: string;
  module?: string;
  actorRole?: string;
  status?: string;
  actorEmail?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
};

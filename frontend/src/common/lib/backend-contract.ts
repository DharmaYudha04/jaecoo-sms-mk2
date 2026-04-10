import {
  BACKEND_PRIORITY_LEVELS,
  BACKEND_ROLES,
  BACKEND_SERVICE_STATUSES,
  BACKEND_WORK_ORDER_STATUSES,
  type BackendPriorityLevel,
  type BackendRole,
  type BackendServiceStatus,
  type BackendWorkOrderStatus,
} from '@/common/types/backend-enums';

export function isBackendRole(value: unknown): value is BackendRole {
  return typeof value === 'string' && BACKEND_ROLES.includes(value as BackendRole);
}

export function isBackendServiceStatus(value: unknown): value is BackendServiceStatus {
  return typeof value === 'string' && BACKEND_SERVICE_STATUSES.includes(value as BackendServiceStatus);
}

export function isBackendWorkOrderStatus(value: unknown): value is BackendWorkOrderStatus {
  return typeof value === 'string' && BACKEND_WORK_ORDER_STATUSES.includes(value as BackendWorkOrderStatus);
}

export function isBackendPriorityLevel(value: unknown): value is BackendPriorityLevel {
  return typeof value === 'string' && BACKEND_PRIORITY_LEVELS.includes(value as BackendPriorityLevel);
}

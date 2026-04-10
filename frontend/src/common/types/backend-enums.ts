export const BACKEND_ROLES = ['MEKANIK', 'FRONTLINE', 'MANAGER', 'ADMIN'] as const;
export type BackendRole = (typeof BACKEND_ROLES)[number];

export const BACKEND_SERVICE_STATUSES = [
  'ANTRIAN',
  'DIKERJAKAN',
  'TEST_DRIVE',
  'SELESAI',
  'DIAMBIL',
  'TERKENDALA',
] as const;
export type BackendServiceStatus = (typeof BACKEND_SERVICE_STATUSES)[number];

// Backend schema currently stores WorkOrder.status as a string with OPEN default.
// Keep the frontend compatible with the current schema while still constraining known values.
export const BACKEND_WORK_ORDER_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'] as const;
export type BackendWorkOrderStatus = (typeof BACKEND_WORK_ORDER_STATUSES)[number];

export const BACKEND_PRIORITY_LEVELS = ['NORMAL', 'HIGH', 'URGENT'] as const;
export type BackendPriorityLevel = (typeof BACKEND_PRIORITY_LEVELS)[number];

export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  customers: {
    list: '/customers',
    create: '/customers',
    detail: (nik: string) => `/customers/${nik}`,
  },
  vehicles: {
    list: '/vehicles',
    create: '/vehicles',
    detail: (noRangka: string) => `/vehicles/${noRangka}`,
  },
  workOrders: {
    list: '/work-orders',
    create: '/work-orders',
    detail: (id: string | number) => `/work-orders/${id}`,
    update: (id: string | number) => `/work-orders/${id}`,
    delete: (id: string | number) => `/work-orders/${id}`,
  },
  services: {
    list: '/services',
    create: '/services',
    detail: (serviceId: string | number) => `/services/${serviceId}`,
    update: (serviceId: string | number) => `/services/${serviceId}`,
    status: (serviceId: string | number) => `/services/${serviceId}/status`,
    notes: (serviceId: string | number) => `/services/${serviceId}/notes`,
  },
  users: {
    list: '/users',
    create: '/users',
    update: (id: string | number) => `/users/${id}`,
    delete: (id: string | number) => `/users/${id}`,
  },
  schedules: {
    create: '/schedules',
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    read: (id: string | number) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
    delete: (id: string | number) => `/notifications/${id}`,
    clearAll: '/notifications',
    pushPublicKey: '/notifications/push/public-key',
    pushSubscribe: '/notifications/push/subscribe',
  },

  broadcasts: {
    list: '/broadcasts',
    unreadCount: '/broadcasts/unread-count',
    create: '/broadcasts',
    read: (id: string | number) => `/broadcasts/${id}/read`,
    readAll: '/broadcasts/read-all',
    delete: (id: string | number) => `/broadcasts/${id}`,
    clearAll: '/broadcasts',
  },
  events: {
    stream: '/events/stream',
  },
  auditLogs: {
    list: '/audit-logs',
    delete: (id: string | number) => `/audit-logs/${id}`,
    clearAll: '/audit-logs',
  },
} as const;

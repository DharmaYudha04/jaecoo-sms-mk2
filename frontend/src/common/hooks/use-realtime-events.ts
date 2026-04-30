import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/services/endpoints';
import { apiClient } from '@/services/api-client';
import { authStorage } from '@/services/auth-storage';
import { queryKeys } from '@/services/query-keys';

type RealtimeEventPayload = {
  id?: string | number;
  workOrderId?: string | number;
  serviceId?: string | number;
  notification?: {
    id?: string | number;
    category?: 'system' | 'broadcast';
    entityType?: string | null;
    targetPath?: string | null;
  };
};

const RECONNECT_DELAY_MS = 5000;

function parsePayload(event: MessageEvent): RealtimeEventPayload {
  try {
    return JSON.parse(event.data || '{}') as RealtimeEventPayload;
  } catch {
    return {};
  }
}

export function useRealtimeEvents(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = authStorage.getToken();
    if (!token) return;

    let source: EventSource | null = null;
    let reconnectTimer: number | null = null;
    let closedByClient = false;

    const refetchNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const refetchBroadcasts = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    };

    const refetchWorkOrders = (payload: RealtimeEventPayload = {}) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      const workOrderId = payload.workOrderId ?? payload.id;
      if (workOrderId != null) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.workOrderDetail(workOrderId) });
      }

      if (payload.serviceId != null) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.serviceDetail(payload.serviceId) });
      }
    };

    const handleNotificationCreated = (event: MessageEvent) => {
      const payload = parsePayload(event);
      const category = payload.notification?.category;

      if (category === 'broadcast') {
        refetchBroadcasts();
        return;
      }

      refetchNotifications();
    };

    const handleBroadcastCreated = () => {
      refetchBroadcasts();
    };

    const handleWorkOrderChanged = (event: MessageEvent) => {
      refetchWorkOrders(parsePayload(event));
    };

    const connect = () => {
      if (closedByClient) return;

      const streamUrl = new URL(`${apiClient.defaults.baseURL}${endpoints.events.stream}`);
      streamUrl.searchParams.set('token', token);
      source = new EventSource(streamUrl.toString());

      source.addEventListener('notification.created', handleNotificationCreated as EventListener);
      source.addEventListener('broadcast.created', handleBroadcastCreated as EventListener);
      source.addEventListener('work_order.created', handleWorkOrderChanged as EventListener);
      source.addEventListener('work_order.updated', handleWorkOrderChanged as EventListener);
      source.addEventListener('service.updated', handleWorkOrderChanged as EventListener);

      source.onerror = () => {
        source?.close();
        source = null;
        if (closedByClient || reconnectTimer) return;
        reconnectTimer = window.setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      closedByClient = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      source?.close();
    };
  }, [enabled, queryClient]);
}

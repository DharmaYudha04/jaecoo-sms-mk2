import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/services/endpoints';
import { apiClient } from '@/services/api-client';
import { authStorage } from '@/services/auth-storage';
import { queryKeys } from '@/services/query-keys';

export function useRealtimeEvents(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = authStorage.getToken();
    if (!token) return;

    let source: EventSource | null = null;
    let reconnectTimer: number | null = null;

    const invalidateCore = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
      void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    const connect = () => {
      const streamUrl = new URL(`${apiClient.defaults.baseURL}${endpoints.events.stream}`);
      streamUrl.searchParams.set('token', token);
      source = new EventSource(streamUrl.toString());

      const handleMessage = () => {
        invalidateCore();
      };

      source.addEventListener('notification.created', handleMessage as EventListener);
      source.addEventListener('broadcast.created', handleMessage as EventListener);
      source.addEventListener('ready', handleMessage as EventListener);

      source.onerror = () => {
        source?.close();
        if (reconnectTimer) {
          window.clearTimeout(reconnectTimer);
        }
        reconnectTimer = window.setTimeout(connect, 1500);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      source?.close();
    };
  }, [enabled, queryClient]);
}

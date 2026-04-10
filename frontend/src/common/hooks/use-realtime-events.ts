import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@/services/endpoints';
import { apiClient } from '@/services/api-client';
import { authStorage } from '@/services/auth-storage';
import { queryKeys } from '@/services/query-keys';
import { showNotificationFromPayload } from '@/common/lib/browser-notifications';

type EventPayload = {
  notification?: {
    id: number;
    title: string;
    message: string;
    targetPath?: string | null;
    entityType?: string | null;
    category?: 'system' | 'broadcast';
  };
};

export function useRealtimeEvents(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = authStorage.getToken();
    if (!token) return;

    const streamUrl = new URL(`${apiClient.defaults.baseURL}${endpoints.events.stream}`);
    streamUrl.searchParams.set('token', token);
    const source = new EventSource(streamUrl.toString());

    const invalidateCore = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
      void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.workOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as EventPayload;
        if (parsed.notification) {
          showNotificationFromPayload(parsed.notification);
        }
      } catch {
        // ignore malformed payload
      }
      invalidateCore();
    };

    source.addEventListener('notification.created', handleMessage as EventListener);
    source.addEventListener('broadcast.created', handleMessage as EventListener);
    source.addEventListener('ready', invalidateCore as EventListener);

    source.onerror = () => {
      source.close();
      window.setTimeout(() => {
        invalidateCore();
      }, 1500);
    };

    return () => {
      source.removeEventListener('notification.created', handleMessage as EventListener);
      source.removeEventListener('broadcast.created', handleMessage as EventListener);
      source.close();
    };
  }, [enabled, queryClient]);
}

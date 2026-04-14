import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query-keys';
import {
  clearBroadcasts,
  clearNotifications,
  deleteBroadcast,
  deleteNotification,
  getBroadcasts,
  getBroadcastUnreadCount,
  getNotificationUnreadCount,
  getNotifications,
  markAllBroadcastsRead,
  markAllNotificationsRead,
  markBroadcastRead,
  markNotificationRead,
  sendBroadcast,
} from '@/modules/notifications/services/notification-api';
import type { NotificationFilter } from '@/modules/notifications/types/notification.types';
import type { AppNotification, Role } from '@/common/types/domain';

const FALLBACK_REFETCH_MS = 4000;

function removeItemFromCaches(queryClient: ReturnType<typeof useQueryClient>, namespace: 'notifications' | 'broadcasts', id: number) {
  const queryPrefix = namespace === 'notifications' ? 'notifications' : 'broadcasts';
  queryClient.setQueriesData<AppNotification[]>({ queryKey: [queryPrefix] }, (current) => {
    if (!Array.isArray(current)) return current;
    return current.filter((item) => item.id !== id);
  });
}

export function useNotifications(filters: NotificationFilter) {
  return useQuery({
    queryKey: queryKeys.notifications(filters),
    queryFn: () => getNotifications(filters),
    refetchInterval: FALLBACK_REFETCH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notificationsUnreadCount,
    queryFn: getNotificationUnreadCount,
    refetchInterval: FALLBACK_REFETCH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: (_, id) => {
      removeItemFromCaches(queryClient, 'notifications', id);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearNotifications,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
    },
  });
}

export function useBroadcasts(filters: NotificationFilter) {
  return useQuery({
    queryKey: queryKeys.broadcasts(filters),
    queryFn: () => getBroadcasts(filters),
    refetchInterval: FALLBACK_REFETCH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useBroadcastUnreadCount() {
  return useQuery({
    queryKey: queryKeys.broadcastsUnreadCount,
    queryFn: getBroadcastUnreadCount,
    refetchInterval: FALLBACK_REFETCH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useMarkBroadcastRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markBroadcastRead(id),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
    },
  });
}


export function useMarkAllBroadcastsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllBroadcastsRead,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
    },
  });
}

export function useClearBroadcasts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearBroadcasts,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
    },
  });
}

export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBroadcast(id),
    onSuccess: (_, id) => {
      removeItemFromCaches(queryClient, 'broadcasts', id);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
    },
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; message: string; targetRoles: Role[] }) => sendBroadcast(payload),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['broadcasts'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount }),
        queryClient.refetchQueries({ queryKey: ['broadcasts'] }),
        queryClient.refetchQueries({ queryKey: queryKeys.broadcastsUnreadCount }),
        queryClient.refetchQueries({ queryKey: ['notifications'] }),
        queryClient.refetchQueries({ queryKey: queryKeys.notificationsUnreadCount }),
      ]);
    },
  });
}

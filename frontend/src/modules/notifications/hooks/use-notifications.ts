import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query-keys';
import {
  clearBroadcasts,
  clearNotifications,
  getBroadcasts,
  getBroadcastUnreadCount,
  getNotifications,
  getNotificationUnreadCount,
  markAllBroadcastsRead,
  markAllNotificationsRead,
  markBroadcastRead,
  markNotificationRead,
  sendBroadcast,
} from '@/modules/notifications/services/notification-api';
import type { NotificationFilter } from '@/modules/notifications/types/notification.types';
import type { Role } from '@/common/types/domain';

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });
}

function invalidateBroadcasts(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.broadcastsUnreadCount });
}

export function useNotifications(filters: NotificationFilter) {
  return useQuery({
    queryKey: queryKeys.notifications(filters),
    queryFn: () => getNotifications(filters),
  });
}

export function useBroadcasts(filters: NotificationFilter) {
  return useQuery({
    queryKey: queryKeys.broadcasts(filters),
    queryFn: () => getBroadcasts(filters),
  });
}

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notificationsUnreadCount,
    queryFn: getNotificationUnreadCount,
  });
}

export function useBroadcastUnreadCount() {
  return useQuery({
    queryKey: queryKeys.broadcastsUnreadCount,
    queryFn: getBroadcastUnreadCount,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      invalidateNotifications(queryClient);
    },
  });
}

export function useMarkBroadcastRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markBroadcastRead(id),
    onSuccess: () => {
      invalidateBroadcasts(queryClient);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      invalidateNotifications(queryClient);
    },
  });
}

export function useMarkAllBroadcastsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllBroadcastsRead,
    onSuccess: () => {
      invalidateBroadcasts(queryClient);
    },
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearNotifications,
    onSuccess: () => {
      invalidateNotifications(queryClient);
    },
  });
}

export function useClearBroadcasts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearBroadcasts,
    onSuccess: () => {
      invalidateBroadcasts(queryClient);
    },
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; message: string; targetRoles: Role[] }) => sendBroadcast(payload),
    onSuccess: () => {
      invalidateBroadcasts(queryClient);
    },
  });
}

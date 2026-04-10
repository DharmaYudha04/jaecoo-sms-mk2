import { apiClient } from '@/services/api-client';
import { endpoints } from '@/services/endpoints';
import { unwrapApiCollection } from '@/common/lib/api-response';
import type { AppNotification, Role } from '@/common/types/domain';
import type { NotificationFilter } from '@/modules/notifications/types/notification.types';

function buildParams(filters: NotificationFilter = {}) {
  return {
    search: filters.search || undefined,
    status: filters.status === 'unread' ? 'unread' : undefined,
    sort: filters.sort ?? 'newest',
  };
}

export async function getNotifications(filters: NotificationFilter = {}): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[] | { data?: AppNotification[] }>(endpoints.notifications.list, {
    params: buildParams(filters),
  });
  return unwrapApiCollection(data) as AppNotification[];
}

export async function getBroadcasts(filters: NotificationFilter = {}): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[] | { data?: AppNotification[] }>(endpoints.broadcasts.list, {
    params: buildParams(filters),
  });
  return unwrapApiCollection(data) as AppNotification[];
}

export async function getNotificationUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count?: number }>(endpoints.notifications.unreadCount);
  return Number(data.count ?? 0);
}

export async function getBroadcastUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count?: number }>(endpoints.broadcasts.unreadCount);
  return Number(data.count ?? 0);
}

export async function markNotificationRead(id: number) {
  await apiClient.patch(endpoints.notifications.read(id));
}

export async function markBroadcastRead(id: number) {
  await apiClient.patch(endpoints.broadcasts.read(id));
}

export async function markAllNotificationsRead() {
  await apiClient.patch(endpoints.notifications.readAll);
}

export async function markAllBroadcastsRead() {
  await apiClient.patch(endpoints.broadcasts.readAll);
}

export async function clearNotifications() {
  await apiClient.delete(endpoints.notifications.clearAll);
}

export async function clearBroadcasts() {
  await apiClient.delete(endpoints.broadcasts.clearAll);
}

export async function sendBroadcast(payload: { title: string; message: string; targetRoles: Role[] }) {
  await apiClient.post(endpoints.broadcasts.create, payload);
}

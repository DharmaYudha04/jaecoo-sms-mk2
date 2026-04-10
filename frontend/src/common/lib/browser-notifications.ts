import type { AppNotification, DeviceNotificationPermission } from '@/common/types/domain';

function isSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): DeviceNotificationPermission {
  if (!isSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<DeviceNotificationPermission> {
  if (!isSupported()) return 'unsupported';
  if (Notification.permission === 'default') return Notification.requestPermission();
  return Notification.permission;
}

export function showNotificationFromPayload(item: Pick<AppNotification, 'id' | 'title' | 'message'>) {
  if (!isSupported()) return;
  if (Notification.permission !== 'granted') return;
  new Notification(item.title, { body: item.message, tag: `jaecoo-${item.id}` });
}

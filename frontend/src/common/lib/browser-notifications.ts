import { useEffect, useRef, useState } from 'react';
import type { AppNotification } from '@/common/types/domain';

export type BrowserNotificationPermission = NotificationPermission | 'unsupported';

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function getBrowserNotificationPermissionStatus(): BrowserNotificationPermission {
  return getBrowserNotificationPermission();
}

export function useBrowserNotificationPermissionStatus() {
  const [status, setStatus] = useState<BrowserNotificationPermission>(getBrowserNotificationPermissionStatus());

  return {
    status,
    refreshStatus: () => setStatus(getBrowserNotificationPermissionStatus()),
  };
}

export function useBrowserNotifications(items: AppNotification[] | undefined) {
  const seenRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || !items?.length) return;
    if (!('Notification' in window)) return;

    items.forEach((item) => {
      if (seenRef.current.has(item.id)) return;
      seenRef.current.add(item.id);
      if (item.isRead) return;
      if (Notification.permission === 'granted') {
        new Notification(item.title, { body: item.message, tag: `jaecoo-${item.id}` });
      }
    });
  }, [items]);
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'default') return Notification.requestPermission();
  return Notification.permission;
}

export function showNotificationFromPayload(payload: { title: string; message: string }) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(payload.title, { body: payload.message });
}

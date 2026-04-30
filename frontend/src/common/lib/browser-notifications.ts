import { useEffect, useRef, useState } from 'react';
import type { AppNotification } from '@/common/types/domain';

export type BrowserNotificationPermission = NotificationPermission | 'unsupported';

type NotificationPayload = {
  title: string;
  message: string;
  tag?: string;
};

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

async function getReadyServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const existing = await navigator.serviceWorker.getRegistration('/notification-sw.js');
    if (existing) return existing;

    await navigator.serviceWorker.register('/notification-sw.js');
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

async function showBrowserNotification(payload: NotificationPayload): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const options: NotificationOptions = {
    body: payload.message,
    tag: payload.tag,
  };

  const registration = await getReadyServiceWorkerRegistration();
  if (registration?.showNotification) {
    await registration.showNotification(payload.title, options);
    return;
  }

  try {
    new Notification(payload.title, options);
  } catch {
    // Some mobile browsers, especially Chrome Android, expose Notification
    // but reject the constructor. In that case we silently skip the local
    // browser toast instead of crashing the whole React app.
  }
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

      void showBrowserNotification({
        title: item.title,
        message: item.message,
        tag: `jaecoo-${item.id}`,
      });
    });
  }, [items]);
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'default') return Notification.requestPermission();
  return Notification.permission;
}

export function showNotificationFromPayload(payload: { title: string; message: string }) {
  void showBrowserNotification(payload);
}

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import type { DeviceNotificationPermission } from '@/common/types/domain';
import { getBrowserNotificationPermission, requestBrowserNotificationPermission } from '@/common/lib/browser-notifications';
import { getPushPublicConfig, subscribePushDevice, unsubscribePushDevice } from '@/modules/notifications/services/push-api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/notification-sw.js');
}

export function useDeviceNotifications() {
  const user = useAuthStore((state) => state.user);
  const [permission, setPermission] = useState<DeviceNotificationPermission>(() => getBrowserNotificationPermission());
  const [pushSupported, setPushSupported] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const config = await getPushPublicConfig().catch(() => ({ supported: false, publicKey: null }));
      if (!cancelled) {
        setPushSupported(Boolean(config.supported && 'serviceWorker' in navigator && 'PushManager' in window));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusLabel = useMemo(() => {
    if (permission === 'granted') return 'Diaktifkan';
    if (permission === 'denied') return 'Ditolak';
    if (permission === 'unsupported') return 'Tidak support';
    return 'Belum diatur';
  }, [permission]);

  const activate = async () => {
    setIsBusy(true);
    try {
      const nextPermission = await requestBrowserNotificationPermission();
      setPermission(nextPermission);
      if (nextPermission !== 'granted') {
        setStatusMessage('Izin notifikasi belum diaktifkan di browser/perangkat ini.');
        return;
      }

      if (!pushSupported) {
        setStatusMessage('Notifikasi browser aktif. Push background penuh belum tersedia di perangkat/browser ini.');
        return;
      }

      const config = await getPushPublicConfig();
      if (!config.supported || !config.publicKey) {
        setStatusMessage('Server push belum dikonfigurasi. Browser notification tetap aktif selama aplikasi terbuka.');
        return;
      }

      const registration = await registerServiceWorker();
      if (!registration) {
        setStatusMessage('Service worker tidak tersedia di browser ini.');
        return;
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config.publicKey),
        });
      }

      await subscribePushDevice(subscription);
      setStatusMessage(`Notifikasi perangkat aktif untuk ${user?.email ?? 'akun ini'}.`);
    } finally {
      setIsBusy(false);
    }
  };

  const deactivate = async () => {
    setIsBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/notification-sw.js');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await unsubscribePushDevice(subscription.endpoint).catch(() => undefined);
        await subscription.unsubscribe().catch(() => false);
      }
      setStatusMessage('Subscription push perangkat dihentikan.');
    } finally {
      setIsBusy(false);
    }
  };

  return {
    permission,
    pushSupported,
    isBusy,
    statusLabel,
    statusMessage,
    activate,
    deactivate,
  };
}

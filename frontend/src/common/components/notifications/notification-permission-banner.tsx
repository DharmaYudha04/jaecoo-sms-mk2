import { useEffect, useState } from 'react';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from '@/common/lib/browser-notifications';
import type { DeviceNotificationPermission } from '@/common/types/domain';

const statusLabel: Record<string, string> = {
  granted: 'Diaktifkan',
  denied: 'Ditolak',
  default: 'Belum diatur',
  unsupported: 'Tidak didukung',
};

export function NotificationPermissionBanner() {
  const [status, setStatus] = useState<DeviceNotificationPermission>(() => getBrowserNotificationPermission());

  useEffect(() => {
    setStatus(getBrowserNotificationPermission());
  }, []);

  if (status === 'granted') {
    return null;
  }

  const refreshStatus = () => setStatus(getBrowserNotificationPermission());

  return (
    <Card className="mb-5 flex flex-col gap-3 border border-[color:var(--accent)]/25 bg-[color:var(--panel-light)] p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold theme-text">Aktifkan notifikasi perangkat</p>
        <p className="mt-1 text-sm theme-muted">
          Status saat ini: <span className="font-medium theme-text">{statusLabel[status] ?? status}</span>. Aktifkan agar notifikasi baru muncul lebih cepat saat Anda membuka tab lain atau meminimalkan browser.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={async () => {
            const nextStatus = await requestBrowserNotificationPermission();
            setStatus(nextStatus);
          }}
          disabled={status === 'unsupported'}
        >
          {status === 'denied' ? 'Cek kembali izin' : 'Aktifkan notifikasi'}
        </Button>
        <Button type="button" variant="secondary" onClick={refreshStatus}>
          Refresh status
        </Button>
      </div>
    </Card>
  );
}

export function DeviceNotificationStatusInline() {
  const status = getBrowserNotificationPermission();
  return <span>{statusLabel[status] ?? status}</span>;
}

import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { useDeviceNotifications } from '@/common/hooks/use-device-notifications';

export function DeviceNotificationCard() {
  const { statusLabel, statusMessage, permission, pushSupported, isBusy, activate, deactivate } = useDeviceNotifications();

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] theme-muted">Notifikasi perangkat</p>
          <h3 className="mt-2 text-lg font-semibold theme-text">Aktifkan notifikasi laptop / HP</h3>
          <p className="mt-1 text-sm theme-muted">
            Status saat ini: <span className="font-semibold theme-text">{statusLabel}</span>
            {pushSupported ? ' · Push background siap saat server sudah mengirim.' : ' · Browser ini hanya mendukung notifikasi biasa atau server push belum aktif.'}
          </p>
          {statusMessage ? <p className="mt-2 text-sm theme-muted">{statusMessage}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void activate()} disabled={isBusy || permission === 'denied'}>
            {isBusy ? 'Memproses...' : 'Aktifkan notifikasi'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void deactivate()} disabled={isBusy}>
            Nonaktifkan push
          </Button>
        </div>
      </div>
      {permission === 'denied' ? (
        <p className="text-sm theme-muted">
          Browser menolak izin notifikasi. Ubah izin situs ini di pengaturan browser agar notifikasi perangkat bisa aktif lagi.
        </p>
      ) : null}
    </Card>
  );
}

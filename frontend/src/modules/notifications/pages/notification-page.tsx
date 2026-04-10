import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { Button } from '@/common/components/ui/button';
import { PageHeader } from '@/common/components/page/page-header';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { useToast } from '@/common/components/feedback/toast-provider';
import { getErrorMessage } from '@/common/lib/request-error';
import { DeviceNotificationCard } from '@/modules/notifications/components/device-notification-card';
import { useClearNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/modules/notifications/hooks/use-notifications';

export function NotificationPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'unread'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const filters = useMemo(() => ({ search, status, sort }), [search, status, sort]);
  const notificationsQuery = useNotifications(filters);
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const clearNotificationsMutation = useClearNotifications();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const notifications = notificationsQuery.data ?? [];
  const hasNotifications = notifications.length > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Notifikasi"
        title="Pusat Notifikasi Sistem"
        actions={(
          <>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (!hasNotifications) return;
                const approved = await confirm({
                  title: 'Hapus semua notifikasi?',
                  description: 'Semua notifikasi sistem pada akun ini akan dihapus. Tindakan ini tidak dapat dibatalkan.',
                  confirmLabel: 'Hapus notifikasi',
                  tone: 'danger',
                });
                if (!approved) return;
                try {
                  await clearNotificationsMutation.mutateAsync();
                  showToast({ title: 'Notifikasi dihapus', description: 'Semua notifikasi sistem berhasil dihapus.', tone: 'success' });
                } catch (error) {
                  showToast({ title: 'Gagal menghapus notifikasi', description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus notifikasi.'), tone: 'error' });
                }
              }}
              disabled={!hasNotifications || clearNotificationsMutation.isPending || markAllMutation.isPending}
            >
              {clearNotificationsMutation.isPending ? 'Menghapus...' : 'Hapus notifikasi'}
            </Button>
            <Button type="button" onClick={() => markAllMutation.mutate()} disabled={!hasNotifications || markAllMutation.isPending || clearNotificationsMutation.isPending}>
              {markAllMutation.isPending ? 'Memproses...' : 'Tandai semua dibaca'}
            </Button>
          </>
        )}
      />

      <DeviceNotificationCard />

      <Card className="grid gap-3 md:grid-cols-[1.6fr_0.8fr_0.8fr]">
        <Input placeholder="Cari notifikasi..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select value={status} onChange={(event) => setStatus(event.target.value as 'all' | 'unread')}>
          <option value="all">Semua</option>
          <option value="unread">Belum dibaca</option>
        </Select>
        <Select value={sort} onChange={(event) => setSort(event.target.value as 'newest' | 'oldest')}>
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </Select>
      </Card>

      <Card className="space-y-3">
        {notificationsQuery.isLoading ? <LoadingState message="Memuat notifikasi..." rows={4} /> : notificationsQuery.isError ? <EmptyState message={getErrorMessage(notificationsQuery.error, 'Gagal memuat notifikasi.')} /> : !notifications.length ? <EmptyState message="Belum ada notifikasi sistem." /> : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className={["rounded-[24px] p-5", item.isRead ? 'notification-surface-read' : 'notification-surface-unread'].join(' ')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold theme-text">{item.title}</p>
                    <p className="mt-1 text-sm theme-muted">{item.message}</p>
                    <p className="mt-2 text-xs theme-muted">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    {item.targetPath ? <Link to={item.targetPath}><Button type="button" variant="secondary" className="notification-button-secondary">Buka</Button></Link> : null}
                    {!item.isRead ? <Button type="button" onClick={() => markReadMutation.mutate(item.id)} disabled={markReadMutation.isPending || clearNotificationsMutation.isPending}>{markReadMutation.isPending ? 'Memproses...' : 'Tandai dibaca'}</Button> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

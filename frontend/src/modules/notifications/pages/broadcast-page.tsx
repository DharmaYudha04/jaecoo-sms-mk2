import { useMemo, useState } from 'react';
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
import { BroadcastComposerCard } from '@/modules/notifications/components/broadcast-composer-card';
import { useBroadcasts, useClearBroadcasts, useMarkAllBroadcastsRead, useMarkBroadcastRead } from '@/modules/notifications/hooks/use-notifications';

export function BroadcastPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'unread'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const filters = useMemo(() => ({ search, status, sort }), [search, status, sort]);
  const broadcastsQuery = useBroadcasts(filters);
  const markReadMutation = useMarkBroadcastRead();
  const markAllMutation = useMarkAllBroadcastsRead();
  const clearBroadcastsMutation = useClearBroadcasts();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const broadcasts = broadcastsQuery.data ?? [];
  const hasBroadcasts = broadcasts.length > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Broadcast"
        title="Pusat Broadcast"
        actions={(
          <>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (!hasBroadcasts) return;
                const approved = await confirm({
                  title: 'Hapus semua broadcast?',
                  description: 'Semua broadcast pada akun ini akan dihapus. Tindakan ini tidak dapat dibatalkan.',
                  confirmLabel: 'Hapus broadcast',
                  tone: 'danger',
                });
                if (!approved) return;
                try {
                  await clearBroadcastsMutation.mutateAsync();
                  showToast({ title: 'Broadcast dihapus', description: 'Semua broadcast berhasil dihapus.', tone: 'success' });
                } catch (error) {
                  showToast({ title: 'Gagal menghapus broadcast', description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus broadcast.'), tone: 'error' });
                }
              }}
              disabled={!hasBroadcasts || clearBroadcastsMutation.isPending || markAllMutation.isPending}
            >
              {clearBroadcastsMutation.isPending ? 'Menghapus...' : 'Hapus broadcast'}
            </Button>
            <Button type="button" onClick={() => markAllMutation.mutate()} disabled={!hasBroadcasts || markAllMutation.isPending || clearBroadcastsMutation.isPending}>
              {markAllMutation.isPending ? 'Memproses...' : 'Tandai semua dibaca'}
            </Button>
          </>
        )}
      />

      <BroadcastComposerCard />

      <Card className="grid gap-3 md:grid-cols-[1.6fr_0.8fr_0.8fr]">
        <Input placeholder="Cari broadcast..." value={search} onChange={(event) => setSearch(event.target.value)} />
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
        {broadcastsQuery.isLoading ? <LoadingState message="Memuat broadcast..." rows={4} /> : broadcastsQuery.isError ? <EmptyState message={getErrorMessage(broadcastsQuery.error, 'Gagal memuat broadcast.')} /> : !broadcasts.length ? <EmptyState message="Belum ada broadcast." /> : (
          <div className="space-y-3">
            {broadcasts.map((item) => (
              <div key={item.id} className={["rounded-[24px] p-5", item.isRead ? 'notification-surface-read' : 'notification-surface-unread'].join(' ')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold theme-text">{item.title}</p>
                    <p className="mt-1 text-sm theme-muted">{item.message}</p>
                    <p className="mt-2 text-xs theme-muted">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    {!item.isRead ? <Button type="button" onClick={() => markReadMutation.mutate(item.id)} disabled={markReadMutation.isPending || clearBroadcastsMutation.isPending}>{markReadMutation.isPending ? 'Memproses...' : 'Tandai dibaca'}</Button> : null}
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

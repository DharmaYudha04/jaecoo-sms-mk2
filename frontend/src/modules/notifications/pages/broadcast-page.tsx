import axios from 'axios';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { Button } from '@/common/components/ui/button';
import { PageHeader } from '@/common/components/page/page-header';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { useToast } from '@/common/components/feedback/toast-provider';
import { SearchIcon, TrashIcon } from '@/common/components/ui/action-icons';
import { getErrorMessage } from '@/common/lib/request-error';
import { BroadcastComposerCard } from '@/modules/notifications/components/broadcast-composer-card';
import { useBroadcasts, useClearBroadcasts, useDeleteBroadcast, useMarkAllBroadcastsRead, useMarkBroadcastRead } from '@/modules/notifications/hooks/use-notifications';
import type { AppNotification } from '@/common/types/domain';

const PAGE_SIZE = 20;

function isAlreadyHandledElsewhere(error: unknown) {
  return axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 410);
}

export function BroadcastPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const [searchDraft, setSearchDraft] = useState(search);
  const status = searchParams.get('status') === 'unread' ? 'unread' : 'all';
  const sort = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [pendingReadId, setPendingReadId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const filters = useMemo(() => ({ search, status, sort }), [search, status, sort]);
  const broadcastsQuery = useBroadcasts(filters);
  const markReadMutation = useMarkBroadcastRead();
  const deleteMutation = useDeleteBroadcast();
  const markAllMutation = useMarkAllBroadcastsRead();
  const clearBroadcastsMutation = useClearBroadcasts();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const broadcasts = broadcastsQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(broadcasts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedBroadcasts = broadcasts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasBroadcasts = broadcasts.length > 0;

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      updateParams({ page: String(totalPages) });
    }
  }, [currentPage, totalPages]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (updates.search !== undefined || updates.status !== undefined || updates.sort !== undefined) {
      next.set('page', '1');
    }
    setSearchParams(next, { replace: true });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParams({ search: searchDraft.trim() || null });
  };

  const openBroadcast = async (item: AppNotification) => {
    if (openingId === item.id) return;
    setOpeningId(item.id);
    try {
      if (!item.isRead) {
        await markReadMutation.mutateAsync(item.id);
      }
      if (item.targetPath) {
        navigate(item.targetPath);
      }
    } catch (error) {
      showToast({ title: 'Gagal membuka broadcast', description: getErrorMessage(error, 'Broadcast tidak berhasil dibuka.'), tone: 'error' });
    } finally {
      setOpeningId((current) => (current === item.id ? null : current));
    }
  };

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
                  updateParams({ page: '1' });
                } catch (error) {
                  showToast({ title: 'Gagal menghapus broadcast', description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus broadcast.'), tone: 'error' });
                }
              }}
              disabled={!hasBroadcasts || clearBroadcastsMutation.isPending || markAllMutation.isPending}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
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
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <Input placeholder="Cari broadcast..." value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} />
          <Button type="submit" variant="secondary" className="action-icon-button search-icon-button shrink-0" aria-label="Telusuri broadcast" title="Telusuri broadcast">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
        <Select value={status} onChange={(event) => updateParams({ status: event.target.value === 'unread' ? 'unread' : null })}>
          <option value="all">Semua</option>
          <option value="unread">Belum dibaca</option>
        </Select>
        <Select value={sort} onChange={(event) => updateParams({ sort: event.target.value === 'oldest' ? 'oldest' : null })}>
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </Select>
      </Card>

      <Card className="space-y-3">
        {broadcastsQuery.isLoading ? <LoadingState message="Memuat broadcast..." rows={4} /> : broadcastsQuery.isError ? <EmptyState message={getErrorMessage(broadcastsQuery.error, 'Gagal memuat broadcast.')} /> : !broadcasts.length ? <EmptyState message="Belum ada broadcast." /> : (
          <div className="space-y-4">
            <div className="space-y-3">
              {pagedBroadcasts.map((item) => (
                <div key={item.id} className={["rounded-[24px] p-5", item.isRead ? 'notification-surface-read' : 'notification-surface-unread'].join(' ')}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => void openBroadcast(item)}
                      disabled={pendingReadId === item.id || pendingDeleteId === item.id || clearBroadcastsMutation.isPending || openingId === item.id}
                    >
                      <p className="text-base font-semibold theme-text">{item.title}</p>
                      <p className="mt-1 text-sm theme-muted">{item.message}</p>
                      <p className="mt-2 text-xs theme-muted">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                    </button>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant={item.isRead ? 'secondary' : 'primary'}
                        className={item.isRead ? 'notification-action-button notification-action-button--done' : 'notification-action-button notification-action-button--read'}
                        aria-label={item.isRead ? `Broadcast ${item.title} sudah dibaca` : `Tandai broadcast ${item.title} sebagai dibaca`}
                        title={item.isRead ? 'Sudah dibaca' : 'Tandai dibaca'}
                        disabled={item.isRead || pendingReadId === item.id || pendingDeleteId === item.id || clearBroadcastsMutation.isPending || openingId === item.id}
                        onClick={async () => {
                          setPendingReadId(item.id);
                          try {
                            await markReadMutation.mutateAsync(item.id);
                            showToast({ title: 'Broadcast ditandai dibaca', description: 'Status broadcast telah diperbarui.', tone: 'success' });
                          } catch (error) {
                            if (isAlreadyHandledElsewhere(error)) {
                              showToast({ title: 'Broadcast sudah diperbarui', description: 'Item ini sudah berubah dari perangkat atau sesi lain.', tone: 'info' });
                            } else {
                              showToast({ title: 'Gagal menandai broadcast', description: getErrorMessage(error, 'Broadcast tidak berhasil ditandai sebagai dibaca.'), tone: 'error' });
                            }
                          } finally {
                            setPendingReadId((current) => (current === item.id ? null : current));
                          }
                        }}
                      >
                        {pendingReadId === item.id ? 'Memproses...' : item.isRead ? 'Sudah dibaca' : 'Tandai dibaca'}
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        className="notification-action-button notification-action-button--delete"
                        aria-label={`Hapus broadcast ${item.title}`}
                        title="Hapus broadcast"
                        disabled={pendingDeleteId === item.id || pendingReadId === item.id || clearBroadcastsMutation.isPending || openingId === item.id}
                        onClick={async () => {
                          setPendingDeleteId(item.id);
                          try {
                            await deleteMutation.mutateAsync(item.id);
                            showToast({ title: 'Broadcast dihapus', description: 'Broadcast telah dihapus dari akun Anda.', tone: 'success' });
                            if (pagedBroadcasts.length === 1 && currentPage > 1) {
                              updateParams({ page: String(currentPage - 1) });
                            }
                          } catch (error) {
                            if (isAlreadyHandledElsewhere(error)) {
                              showToast({ title: 'Broadcast sudah tidak tersedia', description: 'Item ini sudah dihapus dari perangkat atau sesi lain.', tone: 'info' });
                              if (pagedBroadcasts.length === 1 && currentPage > 1) {
                                updateParams({ page: String(currentPage - 1) });
                              }
                            } else {
                              showToast({ title: 'Gagal menghapus broadcast', description: getErrorMessage(error, 'Broadcast tidak berhasil dihapus.'), tone: 'error' });
                            }
                          } finally {
                            setPendingDeleteId((current) => (current === item.id ? null : current));
                          }
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>{pendingDeleteId === item.id ? 'Menghapus...' : 'Hapus'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel-light)] px-4 py-3 text-sm theme-muted">
              <span>Halaman {currentPage} dari {totalPages} • {broadcasts.length} data</span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" type="button" disabled={currentPage <= 1} onClick={() => updateParams({ page: String(currentPage - 1) })}>Sebelumnya</Button>
                <Button variant="secondary" type="button" disabled={currentPage >= totalPages} onClick={() => updateParams({ page: String(currentPage + 1) })}>Berikutnya</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

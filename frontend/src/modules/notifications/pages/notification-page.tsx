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
import { useClearNotifications, useDeleteNotification, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/modules/notifications/hooks/use-notifications';
import type { AppNotification } from '@/common/types/domain';

const PAGE_SIZE = 20;

function isAlreadyHandledElsewhere(error: unknown) {
  return axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 410);
}

export function NotificationPage() {
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
  const notificationsQuery = useNotifications(filters);
  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();
  const markAllMutation = useMarkAllNotificationsRead();
  const clearNotificationsMutation = useClearNotifications();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const notifications = notificationsQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedNotifications = notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasNotifications = notifications.length > 0;

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

  const openNotification = async (item: AppNotification) => {
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
      showToast({ title: 'Gagal membuka notifikasi', description: getErrorMessage(error, 'Notifikasi tidak berhasil dibuka.'), tone: 'error' });
    } finally {
      setOpeningId((current) => (current === item.id ? null : current));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Notifikasi"
        title="Pusat Notifikasi"
        actions={(
          <>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (!hasNotifications) return;
                const approved = await confirm({
                  title: 'Hapus semua notifikasi?',
                  description: 'Semua notifikasi pada akun ini akan dihapus. Tindakan ini tidak dapat dibatalkan.',
                  confirmLabel: 'Hapus notifikasi',
                  tone: 'danger',
                });
                if (!approved) return;
                try {
                  await clearNotificationsMutation.mutateAsync();
                  showToast({ title: 'Notifikasi dihapus', description: 'Semua notifikasi berhasil dihapus.', tone: 'success' });
                  updateParams({ page: '1' });
                } catch (error) {
                  showToast({ title: 'Gagal menghapus notifikasi', description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus notifikasi.'), tone: 'error' });
                }
              }}
              disabled={!hasNotifications || clearNotificationsMutation.isPending || markAllMutation.isPending}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {clearNotificationsMutation.isPending ? 'Menghapus...' : 'Hapus notifikasi'}
            </Button>
            <Button type="button" onClick={() => markAllMutation.mutate()} disabled={!hasNotifications || markAllMutation.isPending || clearNotificationsMutation.isPending}>
              {markAllMutation.isPending ? 'Memproses...' : 'Tandai semua dibaca'}
            </Button>
          </>
        )}
      />

      <Card className="grid gap-3 md:grid-cols-[1.6fr_0.8fr_0.8fr]">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <Input placeholder="Cari notifikasi..." value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} />
          <Button type="submit" variant="secondary" className="action-icon-button search-icon-button shrink-0" aria-label="Telusuri notifikasi" title="Telusuri notifikasi">
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
        {notificationsQuery.isLoading ? <LoadingState message="Memuat notifikasi..." rows={4} /> : notificationsQuery.isError ? <EmptyState message={getErrorMessage(notificationsQuery.error, 'Gagal memuat notifikasi.')} /> : !notifications.length ? <EmptyState message="Belum ada notifikasi." /> : (
          <div className="space-y-4">
            <div className="space-y-3">
              {pagedNotifications.map((item) => (
                <div key={item.id} className={["rounded-[24px] p-5", item.isRead ? 'notification-surface-read' : 'notification-surface-unread'].join(' ')}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => void openNotification(item)}
                      disabled={pendingDeleteId === item.id || pendingReadId === item.id || clearNotificationsMutation.isPending || openingId === item.id}
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
                        aria-label={item.isRead ? `Notifikasi ${item.title} sudah dibaca` : `Tandai notifikasi ${item.title} sebagai dibaca`}
                        title={item.isRead ? 'Sudah dibaca' : 'Tandai dibaca'}
                        disabled={item.isRead || pendingReadId === item.id || pendingDeleteId === item.id || clearNotificationsMutation.isPending || openingId === item.id}
                        onClick={async () => {
                          setPendingReadId(item.id);
                          try {
                            await markReadMutation.mutateAsync(item.id);
                            showToast({ title: 'Notifikasi ditandai dibaca', description: 'Status notifikasi telah diperbarui.', tone: 'success' });
                          } catch (error) {
                            if (isAlreadyHandledElsewhere(error)) {
                              showToast({ title: 'Notifikasi sudah diperbarui', description: 'Item ini sudah berubah dari perangkat atau sesi lain.', tone: 'info' });
                            } else {
                              showToast({ title: 'Gagal menandai notifikasi', description: getErrorMessage(error, 'Notifikasi tidak berhasil ditandai sebagai dibaca.'), tone: 'error' });
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
                        aria-label={`Hapus notifikasi ${item.title}`}
                        title="Hapus notifikasi"
                        disabled={pendingDeleteId === item.id || pendingReadId === item.id || clearNotificationsMutation.isPending || openingId === item.id}
                        onClick={async () => {
                          setPendingDeleteId(item.id);
                          try {
                            await deleteMutation.mutateAsync(item.id);
                            showToast({ title: 'Notifikasi dihapus', description: 'Notifikasi telah dihapus dari akun Anda.', tone: 'success' });
                            if (pagedNotifications.length === 1 && currentPage > 1) {
                              updateParams({ page: String(currentPage - 1) });
                            }
                          } catch (error) {
                            if (isAlreadyHandledElsewhere(error)) {
                              showToast({ title: 'Notifikasi sudah tidak tersedia', description: 'Item ini sudah dihapus dari perangkat atau sesi lain.', tone: 'info' });
                              if (pagedNotifications.length === 1 && currentPage > 1) {
                                updateParams({ page: String(currentPage - 1) });
                              }
                            } else {
                              showToast({ title: 'Gagal menghapus notifikasi', description: getErrorMessage(error, 'Notifikasi tidak berhasil dihapus.'), tone: 'error' });
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
              <span>Halaman {currentPage} dari {totalPages} • {notifications.length} data</span>
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

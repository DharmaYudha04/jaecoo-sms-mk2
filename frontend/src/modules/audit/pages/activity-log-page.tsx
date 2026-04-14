import { FormEvent, useMemo, useState } from 'react';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { useToast } from '@/common/components/feedback/toast-provider';
import { ListCard } from '@/common/components/data-display/list-card';
import { PageHeader } from '@/common/components/page/page-header';
import { SearchIcon, TrashIcon } from '@/common/components/ui/action-icons';
import { roleLabels } from '@/common/lib/authz';
import { getErrorMessage } from '@/common/lib/request-error';
import { useActivityLogs, useClearActivityLogs, useDismissActivityLog } from '@/modules/audit/hooks/use-audit-logs';
import type { ActivityLog, ActivityLogFilters } from '@/modules/audit/types/audit.types';

const defaultFilters: ActivityLogFilters = {
  search: '',
  module: '',
  actorRole: '',
  status: '',
  actorEmail: '',
  dateFrom: '',
  dateTo: '',
  limit: 120,
};

function formatDateTime(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatActionLabel(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function summarizeMetadata(log: ActivityLog) {
  const metadata = log.metadata ?? {};
  const keys = Object.keys(metadata);
  if (keys.length === 0) return 'Tidak ada metadata tambahan.';
  if (Array.isArray(metadata.changedSections)) {
    return `Bagian berubah: ${(metadata.changedSections as string[]).join(', ')}`;
  }
  if (typeof metadata.noteLength === 'number') {
    return `Panjang catatan: ${metadata.noteLength} karakter`;
  }
  if (typeof metadata.detailCount === 'number') {
    return `Jumlah detail servis: ${metadata.detailCount}`;
  }
  if (metadata.before && metadata.after) {
    return 'Tersedia detail before/after untuk ditinjau.';
  }
  return `Metadata tersedia (${keys.length} item).`;
}

function JsonPreview({ value }: { value: Record<string, unknown> | null | undefined }) {
  if (!value || Object.keys(value).length === 0) {
    return <p className="text-sm theme-muted">Tidak ada metadata tambahan.</p>;
  }

  return (
    <pre className="max-h-[360px] overflow-auto rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-4 text-xs leading-6 theme-muted">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function ActivityLogPage() {
  const [filters, setFilters] = useState<ActivityLogFilters>(defaultFilters);
  const logsQuery = useActivityLogs(filters);
  const clearLogsMutation = useClearActivityLogs();
  const dismissLogMutation = useDismissActivityLog();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const logs = logsQuery.data ?? [];
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  const selectedLog = useMemo(
    () => logs.find((item) => item.id === selectedLogId) ?? logs[0] ?? null,
    [logs, selectedLogId],
  );

  const stats = useMemo(() => {
    const total = logs.length;
    const failed = logs.filter((item) => item.status === 'FAILED').length;
    const loginEvents = logs.filter((item) => item.module === 'auth').length;
    const workOrderEvents = logs.filter((item) => item.module === 'work-orders').length;
    return { total, failed, loginEvents, workOrderEvents };
  }, [logs]);

  const submitFilters = (event: FormEvent) => {
    event.preventDefault();
    void logsQuery.refetch();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Audit"
        title="Riwayat Aktivitas"
        actions={(
          <>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (!logs.length) return;
                const approved = await confirm({
                  title: 'Hapus riwayat aktivitas?',
                  description: 'Seluruh riwayat aktivitas akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan.',
                  confirmLabel: 'Hapus riwayat aktivitas',
                  tone: 'danger',
                });
                if (!approved) return;
                try {
                  await clearLogsMutation.mutateAsync();
                  setSelectedLogId(null);
                  showToast({ title: 'Riwayat aktivitas dihapus', description: 'Semua riwayat aktivitas berhasil dihapus.', tone: 'success' });
                } catch (error) {
                  showToast({ title: 'Gagal menghapus riwayat aktivitas', description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus riwayat aktivitas.'), tone: 'error' });
                }
              }}
              disabled={!logs.length || clearLogsMutation.isPending}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {clearLogsMutation.isPending ? 'Menghapus...' : 'Hapus riwayat aktivitas'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => logsQuery.refetch()} disabled={clearLogsMutation.isPending}>
              Muat Ulang
            </Button>
          </>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">Total Aktivitas</p>
          <p className="mt-3 text-3xl font-semibold theme-text">{stats.total}</p>
          <p className="mt-2 text-sm theme-muted">Data terbaru yang ditarik untuk pemantauan admin dan manajer.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">Error Tercatat</p>
          <p className="mt-3 text-3xl font-semibold text-red-300">{stats.failed}</p>
          <p className="mt-2 text-sm theme-muted">Gunakan filter status FAILED untuk menelusuri detail masalah.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">Aktivitas Login</p>
          <p className="mt-3 text-3xl font-semibold theme-text">{stats.loginEvents}</p>
          <p className="mt-2 text-sm theme-muted">Masuk berhasil maupun gagal tercatat untuk bahan evaluasi.</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">Perubahan Work Order</p>
          <p className="mt-3 text-3xl font-semibold theme-text">{stats.workOrderEvents}</p>
          <p className="mt-2 text-sm theme-muted">Pantau perubahan intake dan proses dengan cepat dari satu laman.</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">Filter</p>
          <h2 className="mt-3 text-xl font-semibold theme-text">Telusuri aktivitas</h2>
        </div>
        <form onSubmit={submitFilters} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Cari email, aksi, WO, pesan..."
            value={filters.search ?? ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <Input
            placeholder="Filter email pelaku"
            value={filters.actorEmail ?? ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, actorEmail: event.target.value }))}
          />
          <Select value={filters.module ?? ''} onChange={(event) => setFilters((prev) => ({ ...prev, module: event.target.value }))}>
            <option value="">Semua modul</option>
            <option value="auth">Auth</option>
            <option value="work-orders">Work Order</option>
            <option value="services">Servis</option>
            <option value="users">Pegawai</option>
          </Select>
          <Select value={filters.status ?? ''} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as ActivityLogFilters['status'] }))}>
            <option value="">Semua status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </Select>
          <Select value={filters.actorRole ?? ''} onChange={(event) => setFilters((prev) => ({ ...prev, actorRole: event.target.value as ActivityLogFilters['actorRole'] }))}>
            <option value="">Semua role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="FRONTLINE">FRONTLINE</option>
            <option value="MEKANIK">MEKANIK</option>
          </Select>
          <Input type="date" value={filters.dateFrom ?? ''} onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} />
          <Input type="date" value={filters.dateTo ?? ''} onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))} />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setFilters(defaultFilters)}>Reset</Button>
            <Button type="submit" variant="secondary" className="action-icon-button search-icon-button shrink-0" aria-label="Telusuri aktivitas" title="Telusuri aktivitas">
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>

      {logsQuery.isLoading ? (
        <LoadingState message="Memuat riwayat aktivitas..." rows={5} />
      ) : logs.length === 0 ? (
        <EmptyState message="Belum ada aktivitas yang cocok dengan filter saat ini." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] theme-muted">Timeline</p>
                <h2 className="mt-2 text-xl font-semibold theme-text">Aktivitas terbaru</h2>
              </div>
              <Badge>{logs.length} item</Badge>
            </div>
            <div className="space-y-3">
              {logs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <ListCard
                    key={log.id}
                    className={isSelected ? 'border-[color:var(--accent)] bg-[color:var(--panel)]/95 shadow-[0_16px_36px_rgba(0,0,0,0.14)]' : ''}
                    title={(
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{formatActionLabel(log.action)}</span>
                        <Badge className={log.status === 'FAILED' ? 'border-red-300/30 bg-red-500/10 text-red-200' : 'border-emerald-300/30 bg-emerald-500/10 text-emerald-200'}>{log.status}</Badge>
                        <Badge>{log.module}</Badge>
                      </div>
                    )}
                    subtitle={(
                      <>
                        <p>{log.message ?? 'Tidak ada pesan ringkas.'}</p>
                        <p className="mt-2">{log.actorEmail ?? 'Sistem'} • {log.actorRole ? roleLabels[log.actorRole] : 'Tanpa role'} • {formatDateTime(log.createdAt)}</p>
                        <p className="mt-1 text-xs">{summarizeMetadata(log)}</p>
                      </>
                    )}
                    meta={
                      <div className="flex items-center gap-2">
                        <span className="text-xs theme-muted">#{log.id}</span>
                        <Button
                          type="button"
                          variant="secondary"
                          className="action-icon-button delete-icon-button h-9 min-h-9 w-9"
                          aria-label={`Hapus aktivitas ${log.id}`}
                          title="Hapus aktivitas"
                          onClick={() => {
                            dismissLogMutation.mutate(log.id, {
                              onSuccess: () => {
                                if (selectedLogId === log.id) setSelectedLogId(null);
                                showToast({ title: 'Aktivitas dihapus', description: 'Item riwayat aktivitas telah dihapus dari daftar.', tone: 'success' });
                              },
                            });
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    }
                    footer={
                      <button type="button" className="w-full rounded-2xl border border-[color:var(--line)] px-3 py-2 text-left text-sm theme-text transition hover:border-[color:var(--line-strong)]" onClick={() => setSelectedLogId(log.id)}>
                        Lihat detail aktivitas
                      </button>
                    }
                  />
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] theme-muted">Detail</p>
              <h2 className="mt-2 text-xl font-semibold theme-text">Ringkasan aktivitas</h2>
            </div>
            {selectedLog ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ListCard title="Waktu" subtitle={formatDateTime(selectedLog.createdAt)} />
                  <ListCard title="Pelaku" subtitle={`${selectedLog.actorEmail ?? 'Sistem'}${selectedLog.actorRole ? ` • ${roleLabels[selectedLog.actorRole]}` : ''}`} />
                  <ListCard title="Modul" subtitle={selectedLog.module} />
                  <ListCard title="Status" subtitle={selectedLog.status} />
                  <ListCard title="Entitas" subtitle={selectedLog.entityLabel ?? selectedLog.entityType ?? '-'} />
                  <ListCard title="ID Entitas" subtitle={selectedLog.entityId ?? '-'} />
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] theme-muted">Pesan</p>
                  <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-4 text-sm theme-text">
                    {selectedLog.message ?? 'Tidak ada pesan.'}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] theme-muted">Metadata</p>
                  <JsonPreview value={selectedLog.metadata} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ListCard title="IP Address" subtitle={selectedLog.ipAddress ?? '-'} />
                  <ListCard title="User Agent" subtitle={selectedLog.userAgent ?? '-'} />
                </div>
              </div>
            ) : (
              <EmptyState message="Pilih salah satu aktivitas di sebelah kiri untuk melihat detailnya." />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

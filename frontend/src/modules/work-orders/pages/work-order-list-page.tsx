import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/common/components/feedback/toast-provider';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { Button } from '@/common/components/ui/button';
import { PageHeader } from '@/common/components/page/page-header';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { hasPermission } from '@/common/lib/authz';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { useWorkOrders, useDeleteWorkOrder } from '@/modules/work-orders/hooks/use-work-orders';
import { useServices } from '@/modules/services/hooks/use-services';
import { hasAnyUnseen, markItemsSeen } from '@/common/lib/unseen-notifications';
import { buildWorkOrderRecords, filterWorkOrderRecords, sortWorkOrderRecords } from '@/modules/work-orders/lib/work-order-records';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';
import { getErrorMessage } from '@/common/lib/request-error';
import { serviceStatusBadgeMap, serviceStatusLabelMap } from '@/common/lib/status-appearance';
import type { ServiceStatus } from '@/common/types/domain';

const PAGE_SIZE = 20;

export function WorkOrderListPage() {
  const workOrdersQuery = useWorkOrders();
  const servicesQuery = useServices();
  const role = useAuthStore((state) => state.user?.role);
  const [sessionSeenIds, setSessionSeenIds] = useState<number[]>([]);
  useUnseenRefresh();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const deleteWorkOrderMutation = useDeleteWorkOrder();
  const { showToast } = useToast();

  const records = useMemo(() => {
    const allRecords = buildWorkOrderRecords({ workOrders: workOrdersQuery.data ?? [], services: servicesQuery.data ?? [], vehicles: [], customers: [] });
    return sortWorkOrderRecords(filterWorkOrderRecords(allRecords, search), sortBy);
  }, [search, servicesQuery.data, sortBy, workOrdersQuery.data]);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = records.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const visibleRecordIds = useMemo(() => pagedRecords.map((record) => record.workOrder.id_wo), [pagedRecords]);

  useEffect(() => {
    if (!role) {
      setSessionSeenIds((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const unseenIds = visibleRecordIds.filter((id) => hasAnyUnseen(role, id));

    setSessionSeenIds((prev) => {
      const same = prev.length === unseenIds.length && prev.every((value, index) => value === unseenIds[index]);
      return same ? prev : unseenIds;
    });

    if (unseenIds.length > 0) {
      markItemsSeen(role, unseenIds);
    }
  }, [role, visibleRecordIds]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (updates.search !== undefined || updates.sort !== undefined) next.set('page', '1');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Work Order"
        title="Work Order"
        actions={hasPermission(role, 'work-orders:create') ? (
          <Link to="/work-orders/new"><Button type="button">Tambah Work Order Baru +</Button></Link>
        ) : null}
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
        <Input value={search} onChange={(event) => updateParams({ search: event.target.value || null })} placeholder="Cari WO, nama pemilik, plat, HP, model, status..." />
        <Select value={sortBy} onChange={(event) => updateParams({ sort: event.target.value })}>
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </Select>
      </div>

      <Card>
        {workOrdersQuery.isLoading || servicesQuery.isLoading ? (
          <LoadingState message="Memuat daftar work order..." rows={4} />
        ) : workOrdersQuery.isError || servicesQuery.isError ? (
          <EmptyState message={getErrorMessage(workOrdersQuery.error ?? servicesQuery.error, 'Gagal memuat data work order dari server.')} />
        ) : records.length === 0 ? (
          <EmptyState message={search ? 'Tidak ada work order yang cocok dengan pencarian.' : 'Belum ada work order yang tersimpan.'} />
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {pagedRecords.map((record) => {
                const resolvedStatus = (record.service?.status ?? 'ANTRIAN') as ServiceStatus;
                const isNewRecord = sessionSeenIds.includes(record.workOrder.id_wo) || hasAnyUnseen(role, record.workOrder.id_wo);

                return (
                  <div key={record.workOrder.id_wo} className={`work-order-row work-order-row--${resolvedStatus.toLowerCase().replace('_', '-')}`}>
                    <div className="work-order-row__accent" aria-hidden="true" />
                    <div className="work-order-row__content">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold theme-text">{record.workOrderCode}</p>
                            {isNewRecord ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.18)]" aria-label="Baru" /> : null}
                          </div>
                          <p className="mt-1 text-sm theme-muted">{record.vehicle?.plat_nomor ?? record.workOrder.no_rangka}</p>
                          <p className="mt-1 text-sm theme-muted">{record.customer?.nama ?? 'Pemilik belum tersedia'} • {record.vehicle?.jenis_mobil ?? 'Model belum tersedia'}</p>
                        </div>

                        <div className="lg:text-right">
                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <span className={serviceStatusBadgeMap[resolvedStatus]}>{serviceStatusLabelMap[resolvedStatus]}</span>
                          </div>
                          <div className="mt-3 space-y-1 text-sm theme-muted">
                            <p>{record.customer?.no_hp ?? '-'}</p>
                            <p>{record.workOrder.waktuMasuk ? new Date(record.workOrder.waktuMasuk).toLocaleString('id-ID') : '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="action-strip mt-4 justify-end">
                        {record.service ? <Link to={`/services/${record.service.id_servis}`}><Button variant="secondary" type="button">Detail</Button></Link> : null}
                        {hasPermission(role, 'work-orders:edit') ? <Link to={`/work-orders/${record.workOrder.id_wo}/edit`}><Button variant="secondary" type="button">Edit</Button></Link> : null}
                        {hasPermission(role, 'work-orders:delete') && ['OPEN', 'CANCELLED'].includes(record.workOrder.status) ? (
                          <Button
                            variant="danger"
                            type="button"
                            disabled={deleteWorkOrderMutation.isPending}
                            onClick={() => {
                              if (!window.confirm('Hapus work order ini dan semua data terkait?')) return;
                              deleteWorkOrderMutation.mutate(record.workOrder.id_wo, {
                                onSuccess: () => {
                                  showToast({ title: 'Work order dihapus', description: 'Work order berhasil dihapus dari database.', tone: 'success' });
                                },
                                onError: (error) => {
                                  showToast({
                                    title: 'Gagal menghapus work order',
                                    description: getErrorMessage(error, 'Work order tidak berhasil dihapus dari server.'),
                                    tone: 'error',
                                  });
                                },
                              });
                            }}
                          >{deleteWorkOrderMutation.isPending ? 'Menghapus...' : 'Hapus'}</Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel-light)] px-4 py-3 text-sm theme-muted">
              <span>Halaman {currentPage} dari {totalPages} • {records.length} data</span>
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

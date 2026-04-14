import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { PageHeader } from '@/common/components/page/page-header';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { Button } from '@/common/components/ui/button';
import { SearchIcon } from '@/common/components/ui/action-icons';
import { serviceStatusLabelMap, serviceStatusPanelMap } from '@/common/lib/status-appearance';
import { useServices } from '@/modules/services/hooks/use-services';
import { useWorkOrders } from '@/modules/work-orders/hooks/use-work-orders';
import { buildWorkOrderRecords, filterWorkOrderRecords, sortWorkOrderRecords } from '@/modules/work-orders/lib/work-order-records';
import { hasAnyUnseen, markItemsSeen } from '@/common/lib/unseen-notifications';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import type { ServiceStatus } from '@/common/types/domain';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';

const PAGE_SIZE = 20;
const serviceStatuses: ServiceStatus[] = ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA'];

export function ServiceStatusPage() {
  const { status = 'ANTRIAN' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const servicesQuery = useServices();
  const workOrdersQuery = useWorkOrders();
  const role = useAuthStore((state) => state.user?.role);
  const [sessionSeenIds, setSessionSeenIds] = useState<number[]>([]);
  useUnseenRefresh();

  const currentStatus = serviceStatuses.includes(status as ServiceStatus) ? (status as ServiceStatus) : 'ANTRIAN';

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const search = searchParams.get('search') ?? '';
  const [searchDraft, setSearchDraft] = useState(search);
  const sortBy = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const workOrders = useMemo(() => workOrdersQuery.data ?? [], [workOrdersQuery.data]);

  const records = useMemo(() => {
    const allRecords = buildWorkOrderRecords({ workOrders, services, vehicles: [], customers: [] });
    const filtered = filterWorkOrderRecords(allRecords, search).filter((record) => record.service?.status === currentStatus);
    return sortWorkOrderRecords(filtered, sortBy);
  }, [currentStatus, search, services, sortBy, workOrders]);

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

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParams({ search: searchDraft.trim() || null });
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Servis" title={serviceStatusLabelMap[currentStatus]} actions={<Link to="/services"><Button variant="secondary" type="button">Kembali ke Board</Button></Link>} />

      <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <Input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Cari WO, nama pemilik, plat, HP, model, status..." />
          <Button type="submit" variant="secondary" className="action-icon-button search-icon-button shrink-0" aria-label="Telusuri status servis" title="Telusuri status servis">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
        <Select value={sortBy} onChange={(event) => updateParams({ sort: event.target.value })}>
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </Select>
      </div>

      {servicesQuery.isLoading || workOrdersQuery.isLoading ? (
        <LoadingState message="Memuat daftar servis..." rows={4} />
      ) : records.length === 0 ? (
        <EmptyState message="Belum ada data untuk status ini." />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            {pagedRecords.map((record) => (
              <Card key={`${record.workOrder.id_wo}-${record.service?.id_servis ?? 'noservice'}`} className={`space-y-4 border ${serviceStatusPanelMap[currentStatus]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] uppercase tracking-[0.24em] theme-muted">{record.workOrderCode}</p>
                      {sessionSeenIds.includes(record.workOrder.id_wo) || hasAnyUnseen(role, record.workOrder.id_wo) ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.18)]" aria-label="Baru" /> : null}
                    </div>
                    <h2 className="mt-2 text-xl font-semibold theme-text">{record.customer?.nama ?? 'Pemilik belum tersedia'}</h2>
                    <p className="mt-1 text-sm theme-muted">{record.vehicle?.plat_nomor ?? '-'} • {record.vehicle?.jenis_mobil ?? record.workOrder.no_rangka}</p>
                  </div>
                  <StatusBadge status={currentStatus} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] theme-muted">Keluhan</p>
                    <p className="mt-2 text-sm theme-text">{record.service?.keluhan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] theme-muted">Kontak</p>
                    <p className="mt-2 text-sm theme-text">{record.customer?.no_hp || '-'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {record.service ? <Link to={`/services/${record.service.id_servis}`}><Button variant="secondary" type="button">Detail Servis</Button></Link> : null}
                  <Link to={`/work-orders?search=${encodeURIComponent(record.workOrderCode)}`}><Button type="button">Lihat WO</Button></Link>
                </div>
              </Card>
            ))}
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
    </div>
  );
}

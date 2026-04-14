import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { Input } from '@/common/components/ui/input';
import { Button } from '@/common/components/ui/button';
import { PageHeader } from '@/common/components/page/page-header';
import { SearchIcon } from '@/common/components/ui/action-icons';
import { ServiceBoard } from '@/modules/services/components/service-board';
import { useServices } from '@/modules/services/hooks/use-services';
import { useWorkOrders } from '@/modules/work-orders/hooks/use-work-orders';
import { buildWorkOrderRecords, filterWorkOrderRecords } from '@/modules/work-orders/lib/work-order-records';

export function ServiceBoardPage() {
  const servicesQuery = useServices();
  const workOrdersQuery = useWorkOrders();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const workOrders = useMemo(() => workOrdersQuery.data ?? [], [workOrdersQuery.data]);

  const filteredServices = useMemo(() => {
    const records = buildWorkOrderRecords({ workOrders, services, vehicles: [], customers: [] });
    const visibleRecords = filterWorkOrderRecords(records, search);
    const visibleWorkOrderIds = new Set(visibleRecords.map((record) => record.workOrder.id_wo));
    return services.filter((service) => visibleWorkOrderIds.has(service.id_wo));
  }, [search, services, workOrders]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    const value = searchDraft.trim();
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Servis" title="Board Servis" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={submitSearch} className="flex w-full items-center gap-2 md:max-w-sm">
          <Input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Cari WO, nama pemilik, plat, HP, status, model..."
          />
          <Button type="submit" variant="secondary" className="action-icon-button search-icon-button shrink-0" aria-label="Telusuri board servis" title="Telusuri board servis">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {servicesQuery.isLoading || workOrdersQuery.isLoading ? (
        <LoadingState message="Memuat board servis..." rows={3} />
      ) : (
        <div className="space-y-4">
          <ServiceBoard services={filteredServices} baseSearch={search} />
          {filteredServices.length === 0 ? <EmptyState message={search ? 'Tidak ada data servis yang cocok dengan pencarian.' : 'Belum ada data servis yang terhubung dari work order.'} /> : null}
        </div>
      )}
    </div>
  );
}

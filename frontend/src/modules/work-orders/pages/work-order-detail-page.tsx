import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/common/components/ui/card';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { PageHeader } from '@/common/components/page/page-header';
import { InfoPanel } from '@/common/components/data-display/info-panel';
import { PropertyList } from '@/common/components/data-display/property-list';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { Button } from '@/common/components/ui/button';
import { useToast } from '@/common/components/feedback/toast-provider';
import { useDeleteWorkOrder, useWorkOrderDetail } from '@/modules/work-orders/hooks/use-work-orders';
import { getErrorMessage } from '@/common/lib/request-error';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { hasPermission } from '@/common/lib/authz';
import { formatWorkOrderCode } from '@/common/lib/work-order-code';

export function WorkOrderDetailPage() {
  const { workOrderId = '' } = useParams();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const { showToast } = useToast();
  const workOrderQuery = useWorkOrderDetail(workOrderId, { enabled: Boolean(workOrderId) });
  const deleteWorkOrderMutation = useDeleteWorkOrder();

  const workOrder = workOrderQuery.data;
  const linkedVehicle = workOrder?.kendaraan;
  const linkedCustomer = linkedVehicle?.pemilik;
  const linkedService = workOrder?.servis?.[0];
  const detailItems = useMemo(
    () => linkedService?.detail_servis?.map((item) => item.keterangan ?? item.nama_servis ?? '').filter(Boolean) ?? [],
    [linkedService],
  );

  if (workOrderQuery.isLoading && !workOrder) {
    return <LoadingState message="Memuat detail work order..." rows={3} />;
  }

  if (workOrderQuery.isError) {
    return <EmptyState message={getErrorMessage(workOrderQuery.error, 'Gagal memuat detail work order dari server.')} />;
  }

  if (!workOrder) {
    return <EmptyState message="Detail work order belum tersedia." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Work Order"
        title={formatWorkOrderCode(workOrder)}
        actions={(
          <>
            {linkedService ? <StatusBadge status={linkedService.status} /> : <span className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--panel-light)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] theme-muted">{workOrder.status}</span>}
            {linkedService ? <Link to={`/services/${linkedService.id_servis}`}><Button variant="secondary" type="button">Detail Servis</Button></Link> : null}
            {hasPermission(role, 'work-orders:edit') ? <Link to={`/work-orders/${workOrder.id_wo}/edit`}><Button variant="secondary" type="button">Edit</Button></Link> : null}
            {hasPermission(role, 'work-orders:delete') && ['OPEN', 'CANCELLED'].includes(workOrder.status) ? (
              <Button
                variant="danger"
                type="button"
                disabled={deleteWorkOrderMutation.isPending}
                onClick={async () => {
                  if (!window.confirm('Hapus work order ini dan semua data terkait?')) return;
                  try {
                    await deleteWorkOrderMutation.mutateAsync(workOrder.id_wo);
                    showToast({ title: 'Work order dihapus', description: 'Work order berhasil dihapus dari database.', tone: 'success' });
                    navigate('/work-orders');
                  } catch (error) {
                    showToast({ title: 'Gagal menghapus work order', description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus work order dari server.'), tone: 'error' });
                  }
                }}
              >
                {deleteWorkOrderMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </Button>
            ) : null}
          </>
        )}
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <InfoPanel title="Ringkasan Work Order">
            <PropertyList items={[
              { label: 'Nomor WO pusat', value: workOrder.nomor_wo_pusat ?? '-' },
              { label: 'Tanggal masuk', value: workOrder.waktuMasuk ? new Date(workOrder.waktuMasuk).toLocaleString('id-ID') : '-' },
              { label: 'Status WO', value: workOrder.status },
              { label: 'Status servis', value: linkedService?.status ?? 'Belum ada servis' },
            ]} />
          </InfoPanel>
          <InfoPanel title="Pelanggan">
            <PropertyList items={[
              { label: 'Nama', value: linkedCustomer?.nama ?? '-' },
              { label: 'NIK', value: linkedCustomer?.nik ?? linkedVehicle?.nik_pemilik ?? '-' },
              { label: 'No HP', value: linkedCustomer?.no_hp ?? '-' },
              { label: 'Alamat', value: linkedCustomer?.alamat ?? '-' },
            ]} />
          </InfoPanel>
          <InfoPanel title="Kendaraan">
            <PropertyList items={[
              { label: 'Plat nomor', value: linkedVehicle?.plat_nomor ?? '-' },
              { label: 'No rangka', value: workOrder.no_rangka ?? linkedVehicle?.no_rangka ?? '-' },
              { label: 'Model', value: linkedVehicle?.jenis_mobil ?? '-' },
              { label: 'Warna', value: linkedVehicle?.warna ?? '-' },
              { label: 'Kilometer', value: linkedVehicle?.kilometer ? `${linkedVehicle.kilometer.toLocaleString('id-ID')} km` : '-' },
            ]} />
          </InfoPanel>
        </Card>

        <Card className="space-y-5">
          <InfoPanel title="Ringkasan Servis">
            <PropertyList items={[
              { label: 'Keluhan', value: linkedService?.keluhan?.trim() ? linkedService.keluhan : '-' },
              { label: 'Prioritas', value: linkedService?.prioritas ?? '-' },
              { label: 'Estimasi selesai', value: linkedService?.estimasiSelesai ? new Date(linkedService.estimasiSelesai).toLocaleString('id-ID') : '-' },
              { label: 'Tanggal selesai', value: linkedService?.tanggalSelesai ? new Date(linkedService.tanggalSelesai).toLocaleString('id-ID') : '-' },
            ]} />
          </InfoPanel>
          <InfoPanel title="Detail Pekerjaan" className="bg-[color:var(--panel)]">
            {detailItems.length ? (
              <ul className="space-y-2 text-sm theme-text">
                {detailItems.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-2"><span className="theme-muted">•</span><span>{item}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-sm theme-muted">Belum ada detail pekerjaan yang dicatat.</p>
            )}
          </InfoPanel>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/work-orders')}>Kembali ke daftar</Button>
            {linkedService ? <Link to={`/services/${linkedService.id_servis}/edit`}><Button type="button">Edit Servis</Button></Link> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

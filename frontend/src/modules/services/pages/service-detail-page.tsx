import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/common/components/ui/card';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { useToast } from '@/common/components/feedback/toast-provider';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { Button } from '@/common/components/ui/button';
import { Select } from '@/common/components/ui/select';
import { Textarea } from '@/common/components/ui/textarea';
import { StatusBadge } from '@/common/components/data-display/status-badge';
import { InfoPanel } from '@/common/components/data-display/info-panel';
import { PropertyList } from '@/common/components/data-display/property-list';
import { PageHeader } from '@/common/components/page/page-header';
import { FieldError, FieldLabel } from '@/common/components/forms/form-field';
import { FormDirtyBanner } from '@/common/components/forms/form-dirty-banner';
import { useUnsavedChanges } from '@/common/hooks/use-unsaved-changes';
import { ServiceTimeline } from '@/modules/services/components/service-timeline';
import { useCreateMechanicNote, useDeleteService, useServiceDetail, useUpdateService, useUpdateServiceStatus } from '@/modules/services/hooks/use-services';
import { useWorkOrders } from '@/modules/work-orders/hooks/use-work-orders';
import { formatWorkOrderCode } from '@/common/lib/work-order-code';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { hasPermission } from '@/common/lib/authz';
import { getErrorMessage } from '@/common/lib/request-error';

const statusSchema = z.object({
  status: z.enum(['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA']),
});

const noteSchema = z.object({
  catatan: z.string().min(3, 'Catatan minimal 3 karakter'),
});

type StatusFormValues = z.infer<typeof statusSchema>;
const washStatusSchema = z.object({
  statusCuciMobil: z.enum(['TIDAK_PERLU', 'MENUNGGU', 'SELESAI']),
  catatanCuciMobil: z.string().max(250, 'Catatan maksimal 250 karakter').optional().or(z.literal('')),
});

type NoteFormValues = z.infer<typeof noteSchema>;
type WashStatusFormValues = z.infer<typeof washStatusSchema>;

const mechanicAllowedStatuses = ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'TERKENDALA'] as const;
const officeAllowedStatuses = ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA'] as const;

export function ServiceDetailPage() {
  const { serviceId = '10' } = useParams();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const serviceDetailQuery = useServiceDetail(serviceId, { enabled: Boolean(serviceId) });
  const workOrdersQuery = useWorkOrders();
  const updateStatusMutation = useUpdateServiceStatus(serviceId);
  const updateWashStatusMutation = useUpdateService(serviceId);
  const createNoteMutation = useCreateMechanicNote(serviceId);
  const deleteServiceMutation = useDeleteService();


  const service = serviceDetailQuery.data;
  const linkedWorkOrder = service?.workOrder ?? workOrdersQuery.data?.find((item) => item.id_wo === service?.id_wo);
  const linkedVehicle = linkedWorkOrder?.kendaraan;
  const linkedCustomer = linkedVehicle?.pemilik;

  const statusForm = useForm<StatusFormValues>({ resolver: zodResolver(statusSchema), defaultValues: { status: service?.status ?? 'ANTRIAN' } });
  const noteForm = useForm<NoteFormValues>({ resolver: zodResolver(noteSchema), defaultValues: { catatan: '' } });
  const washStatusForm = useForm<WashStatusFormValues>({
    resolver: zodResolver(washStatusSchema),
    defaultValues: {
      statusCuciMobil: service?.statusCuciMobil ?? 'TIDAK_PERLU',
      catatanCuciMobil: service?.catatanCuciMobil ?? '',
    },
  });

  useEffect(() => {
    if (service?.status) statusForm.reset({ status: service.status });
  }, [service?.status, statusForm]);

  useEffect(() => {
    if (service) {
      washStatusForm.reset({
        statusCuciMobil: service.statusCuciMobil ?? 'TIDAK_PERLU',
        catatanCuciMobil: service.catatanCuciMobil ?? '',
      });
    }
  }, [service, washStatusForm]);

  useUnsavedChanges({ when: statusForm.formState.isDirty || noteForm.formState.isDirty || washStatusForm.formState.isDirty });

  const timelineItems = useMemo(() => (service?.riwayat?.length ? service.riwayat : []), [service]);
  const detailItems = useMemo(() => service?.detail_servis?.map((item) => item.keterangan ?? item.nama_servis ?? '').filter(Boolean) ?? [], [service]);
  const notes = useMemo(() => service?.catatan ?? [], [service]);
  const allowedStatuses = role === 'MEKANIK' ? mechanicAllowedStatuses : officeAllowedStatuses;
  const activeStatus = service?.status ?? 'ANTRIAN';
  const workOrderLabel = linkedWorkOrder ? formatWorkOrderCode(linkedWorkOrder) : 'WO belum terhubung';
  const complaint = service?.keluhan?.trim() ? service.keluhan : '-';
  const estimationLabel = service?.estimasiSelesai ? new Date(service.estimasiSelesai).toLocaleString('id-ID') : '-';
  const canEditWorkOrder = hasPermission(role, 'work-orders:edit') && Boolean(linkedWorkOrder?.id_wo);
  const canDeleteService = hasPermission(role, 'services:delete');
  const canUpdateStatus = hasPermission(role, 'services:update');
  const canUpdateWashStatus = hasPermission(role, 'services:update');


  if ((serviceDetailQuery.isLoading || workOrdersQuery.isLoading) && !service) {
    return <LoadingState message="Memuat detail servis..." rows={3} />;
  }

  if (serviceDetailQuery.isError || workOrdersQuery.isError) {
    return <EmptyState message={getErrorMessage(serviceDetailQuery.error ?? workOrdersQuery.error, 'Gagal memuat detail servis dari server.')} />;
  }

  if (!service) {
    return <EmptyState message="Detail servis belum tersedia." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <PageHeader
            eyebrow={workOrderLabel}
            title="Servis"
            actions={(
              <>
                <StatusBadge status={activeStatus} />
                {canEditWorkOrder ? <Link to={`/work-orders/${linkedWorkOrder!.id_wo}/edit`}><Button variant="secondary" type="button">Edit Work Order</Button></Link> : null}
                {canDeleteService ? (
                  <Button
                    variant="danger"
                    type="button"
                    onClick={async () => {
                      const approved = await confirm({ title: 'Hapus data servis?', description: 'Data servis akan dihapus secara permanen.', confirmLabel: 'Hapus', tone: 'danger' });
                      if (!approved) return;
                      try {
                        await deleteServiceMutation.mutateAsync(serviceId);
                        showToast({ title: 'Servis berhasil dihapus', description: 'Data servis telah dihapus dari database.', tone: 'success' });
                        navigate('/services');
                      } catch (error) {
                        showToast({ title: 'Gagal menghapus servis', description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus data servis dari server.'), tone: 'error' });
                      }
                    }}
                    disabled={deleteServiceMutation.isPending}
                  >
                    {deleteServiceMutation.isPending ? 'Menghapus...' : 'Hapus'}
                  </Button>
                ) : null}
              </>
            )}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoPanel title="Kendaraan">
              <PropertyList items={[
                { label: 'Plat', value: linkedVehicle?.plat_nomor ?? '-' },
                { label: 'No rangka', value: linkedWorkOrder?.no_rangka ?? linkedVehicle?.no_rangka ?? '-' },
                { label: 'Model', value: linkedVehicle?.jenis_mobil ?? '-' },
                { label: 'Kilometer', value: linkedVehicle?.kilometer ? `${linkedVehicle.kilometer.toLocaleString('id-ID')} km` : '-' },
              ]} />
            </InfoPanel>
            <InfoPanel title="Pelanggan">
              <PropertyList items={[
                { label: 'Nama', value: linkedCustomer?.nama ?? '-' },
                { label: 'No HP', value: linkedCustomer?.no_hp ?? '-' },
                { label: 'Alamat', value: linkedCustomer?.alamat ?? '-' },
                { label: 'Estimasi selesai', value: estimationLabel },
              ]} />
            </InfoPanel>
          </div>

          <InfoPanel title="Keluhan" className="mt-6 bg-[color:var(--panel)]">
            <p className="text-sm theme-muted">{complaint}</p>
          </InfoPanel>

          <InfoPanel title="Cuci Mobil" className="mt-6 bg-[color:var(--panel)]">
            <PropertyList items={[
              { label: 'Status', value: service.statusCuciMobil },
              { label: 'Catatan', value: service.catatanCuciMobil ?? '-' },
            ]} />
          </InfoPanel>

          <InfoPanel title="Detail Servis" className="mt-6 bg-[color:var(--panel)]">
            {detailItems.length === 0 ? <p className="text-sm theme-muted">Belum ada detail servis.</p> : (
              <ul className="space-y-2 text-sm theme-text">
                {detailItems.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span className="theme-muted">•</span><span>{item}</span></li>)}
              </ul>
            )}
          </InfoPanel>

          <InfoPanel title="Catatan Mekanik" className="mt-6 bg-[color:var(--panel)]">
            {notes.length === 0 ? <p className="text-sm theme-muted">Belum ada catatan mekanik.</p> : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id_catatan} className="rounded-[18px] border border-[color:var(--line)] bg-[color:var(--panel-light)] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium theme-text">Catatan</p>
                      <span className="text-xs theme-muted">{new Date(note.waktu).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="mt-2 text-sm theme-muted">{note.catatan}</p>
                  </div>
                ))}
              </div>
            )}
          </InfoPanel>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Timeline</h2>
          <div className="mt-6">
            {timelineItems.length ? <ServiceTimeline items={timelineItems} /> : <EmptyState message="Belum ada riwayat perubahan status." />}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">Form</p>
          <h2 className="mt-3 text-2xl font-semibold">Update Status</h2>
          <FormDirtyBanner visible={statusForm.formState.isDirty || noteForm.formState.isDirty} />
          <form className="mt-5 space-y-4" onSubmit={statusForm.handleSubmit(async (values) => {
            try {
              await updateStatusMutation.mutateAsync(values);
              showToast({ title: 'Status diperbarui', description: 'Perubahan status servis berhasil dikirim.', tone: 'success' });
              statusForm.reset(values);
            } catch (error) {
              showToast({ title: 'Gagal memperbarui status servis', description: getErrorMessage(error, 'Perubahan status servis tidak tersimpan ke server.'), tone: 'error' });
            }
          })}>
            <div>
              <FieldLabel htmlFor="status-update">Status Baru</FieldLabel>
              <Select id="status-update" {...statusForm.register('status')}>
                {allowedStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </Select>
            </div>
            {canUpdateStatus ? <Button type="submit" disabled={updateStatusMutation.isPending}>{updateStatusMutation.isPending ? 'Mengirim...' : 'Kirim Status'}</Button> : <p className="text-sm theme-muted">Role Anda tidak memiliki izin mengubah status servis.</p>}
          </form>
        </Card>


        <Card>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">Form</p>
          <h2 className="mt-3 text-2xl font-semibold">Status Cuci Mobil</h2>
          <form className="mt-5 space-y-4" onSubmit={washStatusForm.handleSubmit(async (values) => {
            if (!service) return;
            try {
              await updateWashStatusMutation.mutateAsync({
                keluhan: service.keluhan,
                estimasiSelesai: service.estimasiSelesai ?? null,
                status: service.status,
                prioritas: service.prioritas,
                statusCuciMobil: values.statusCuciMobil,
                catatanCuciMobil: values.catatanCuciMobil?.trim() ? values.catatanCuciMobil.trim() : null,
                detail_servis: detailItems,
              });
              showToast({ title: 'Status cuci mobil diperbarui', description: 'Perubahan status cuci mobil berhasil dikirim.', tone: 'success' });
              washStatusForm.reset(values);
            } catch (error) {
              showToast({ title: 'Gagal memperbarui status cuci mobil', description: getErrorMessage(error, 'Perubahan status cuci mobil tidak tersimpan ke server.'), tone: 'error' });
            }
          })}>
            <div>
              <FieldLabel htmlFor="statusCuciMobil">Status Cuci Mobil</FieldLabel>
              <Select id="statusCuciMobil" {...washStatusForm.register('statusCuciMobil')}>
                <option value="TIDAK_PERLU">TIDAK PERLU</option>
                <option value="MENUNGGU">MENUNGGU</option>
                <option value="SELESAI">SELESAI</option>
              </Select>
            </div>
            <div>
              <FieldLabel htmlFor="catatanCuciMobil">Catatan Cuci Mobil</FieldLabel>
              <Textarea id="catatanCuciMobil" {...washStatusForm.register('catatanCuciMobil')} />
              <FieldError>{washStatusForm.formState.errors.catatanCuciMobil?.message as string | undefined}</FieldError>
            </div>
            {canUpdateWashStatus ? <Button type="submit" disabled={updateWashStatusMutation.isPending}>{updateWashStatusMutation.isPending ? 'Menyimpan...' : 'Simpan Status Cuci Mobil'}</Button> : <p className="text-sm theme-muted">Role Anda tidak memiliki izin mengubah status cuci mobil.</p>}
          </form>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.28em] theme-muted">Form</p>
          <h2 className="mt-3 text-2xl font-semibold">Catatan Mekanik</h2>
          <form className="mt-5 space-y-4" onSubmit={noteForm.handleSubmit(async (values) => {
            try {
              await createNoteMutation.mutateAsync(values);
              showToast({ title: 'Catatan ditambahkan', description: 'Catatan mekanik berhasil dikirim ke service layer.', tone: 'success' });
              noteForm.reset();
            } catch (error) {
              showToast({ title: 'Gagal menambahkan catatan', description: getErrorMessage(error, 'Catatan mekanik tidak berhasil disimpan ke server.'), tone: 'error' });
            }
          })}>
            <div>
              <FieldLabel htmlFor="catatan">Catatan</FieldLabel>
              <Textarea id="catatan" {...noteForm.register('catatan')} />
              <FieldError>{noteForm.formState.errors.catatan?.message}</FieldError>
            </div>
            {canUpdateStatus ? <Button type="submit" disabled={createNoteMutation.isPending}>{createNoteMutation.isPending ? 'Mengirim...' : 'Kirim Catatan'}</Button> : <p className="text-sm theme-muted">Role Anda tidak memiliki izin mengirim catatan mekanik.</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}

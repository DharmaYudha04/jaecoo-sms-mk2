import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmptyState } from '@/common/components/feedback/empty-state';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { useToast } from '@/common/components/feedback/toast-provider';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { Textarea } from '@/common/components/ui/textarea';
import { PageHeader } from '@/common/components/page/page-header';
import { FieldError, FieldHint, FieldLabel } from '@/common/components/forms/form-field';
import { FormDirtyBanner } from '@/common/components/forms/form-dirty-banner';
import { FormShell } from '@/common/components/forms/form-shell';
import { useUnsavedChanges } from '@/common/hooks/use-unsaved-changes';
import { useServiceDetail, useUpdateService } from '@/modules/services/hooks/use-services';
import type { Service } from '@/common/types/domain';

const serviceSchema = z.object({
  keluhan: z.string().min(3, 'Keluhan minimal 3 karakter'),
  estimasiSelesai: z.string().optional(),
  status: z.enum(['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA']),
  prioritas: z.enum(['NORMAL', 'HIGH', 'URGENT']),
  statusCuciMobil: z.enum(['TIDAK_PERLU', 'MENUNGGU', 'SELESAI']),
  catatanCuciMobil: z.string().optional(),
  detailServis: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

function toDatetimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function buildServiceFormValues(service: Service): ServiceFormValues {
  return {
    keluhan: service.keluhan ?? '',
    estimasiSelesai: toDatetimeLocal(service.estimasiSelesai),
    status: service.status,
    prioritas: service.prioritas,
    statusCuciMobil: service.statusCuciMobil,
    catatanCuciMobil: service.catatanCuciMobil ?? '',
    detailServis: service.detail_servis?.map((item) => item.keterangan ?? item.nama_servis ?? '').filter(Boolean).join('\n') ?? '',
  };
}

export function ServiceEditPage() {
  const { serviceId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const serviceQuery = useServiceDetail(serviceId, { enabled: Boolean(serviceId) });
  const updateServiceMutation = useUpdateService(serviceId);
  const service = serviceQuery.data;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? buildServiceFormValues(service)
      : { keluhan: '', estimasiSelesai: '', status: 'ANTRIAN', prioritas: 'NORMAL', statusCuciMobil: 'TIDAK_PERLU', catatanCuciMobil: '', detailServis: '' },
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = form;
  useUnsavedChanges({ when: isDirty });

  useEffect(() => {
    if (service) reset(buildServiceFormValues(service));
  }, [reset, service]);

  const detailCount = useMemo(
    () => service?.detail_servis?.filter((item) => (item.keterangan ?? item.nama_servis ?? '').trim()).length ?? 0,
    [service],
  );

  if (serviceQuery.isLoading && !service) {
    return <LoadingState message="Memuat data servis..." rows={3} />;
  }

  if (!service) {
    return <EmptyState message="Data servis tidak ditemukan." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={service.id_wo ? `WO #${service.id_wo}` : 'Servis'} title="Edit Servis" />

      <FormShell
        eyebrow="Perbaikan Data"
        title="Ubah Data Servis"
        subtitle="Semua perubahan wajib tersimpan langsung ke database. Tidak ada fallback lokal."
      >
        <FormDirtyBanner visible={isDirty} />
        <form
          className="mt-4 space-y-6"
          onSubmit={handleSubmit(async (values) => {
            const payload = {
              keluhan: values.keluhan.trim(),
              estimasiSelesai: values.estimasiSelesai || null,
              status: values.status,
              prioritas: values.prioritas,
              statusCuciMobil: values.statusCuciMobil,
              catatanCuciMobil: values.catatanCuciMobil?.trim() || null,
              detail_servis: values.detailServis
                ? values.detailServis.split('\n').map((item) => item.trim()).filter(Boolean)
                : [],
            };

            try {
              await updateServiceMutation.mutateAsync(payload);
              showToast({ title: 'Servis diperbarui', description: 'Perubahan data servis berhasil disimpan.', tone: 'success' });
              navigate(`/services/${serviceId}`);
            } catch {
              showToast({ title: 'Gagal memperbarui servis', description: 'Periksa koneksi backend lalu coba lagi.', tone: 'error' });
            }
          })}
        >
          <section className="space-y-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel-light)]/40 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] theme-muted">Ringkasan</p>
              <h3 className="mt-2 text-xl font-semibold theme-text">Kelola identitas utama servis</h3>
              <p className="mt-2 text-sm theme-muted">Servis #{service.id_servis} • {detailCount} item pekerjaan aktif</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel htmlFor="keluhan">Keluhan / Ringkasan Pekerjaan</FieldLabel>
                <Textarea id="keluhan" placeholder="Masukkan ringkasan keluhan pelanggan" {...register('keluhan')} />
                <FieldError>{errors.keluhan?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="estimasiSelesai">Estimasi Selesai</FieldLabel>
                <Input id="estimasiSelesai" type="datetime-local" {...register('estimasiSelesai')} />
              </div>
              <div>
                <FieldLabel htmlFor="prioritas">Prioritas</FieldLabel>
                <Select id="prioritas" {...register('prioritas')}>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="status">Status Servis</FieldLabel>
                <Select id="status" {...register('status')}>
                  <option value="ANTRIAN">ANTRIAN</option>
                  <option value="DIKERJAKAN">PROSES SERVIS</option>
                  <option value="TEST_DRIVE">SIAP TEST DRIVE</option>
                  <option value="SELESAI">SELESAI</option>
                  <option value="DIAMBIL">DIAMBIL</option>
                  <option value="TERKENDALA">TERKENDALA</option>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="statusCuciMobil">Permintaan Cuci Mobil</FieldLabel>
                <Select id="statusCuciMobil" {...register('statusCuciMobil')}>
                  <option value="TIDAK_PERLU">Tidak perlu</option>
                  <option value="MENUNGGU">Diminta / menunggu</option>
                  <option value="SELESAI">Sudah selesai</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="catatanCuciMobil">Catatan Cuci Mobil</FieldLabel>
                <Textarea id="catatanCuciMobil" placeholder="Opsional: permintaan khusus terkait cuci mobil" {...register('catatanCuciMobil')} />
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="detailServis">Detail Servis</FieldLabel>
                <Textarea id="detailServis" placeholder="Satu baris satu item pekerjaan" {...register('detailServis')} />
                <FieldHint>Satu baris satu item pekerjaan agar mudah terbaca di detail servis dan work order.</FieldHint>
                <FieldError>{errors.detailServis?.message}</FieldError>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--line)] pt-4">
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(`/services/${serviceId}`)}>Batal</Button>
              <Button type="button" variant="secondary" onClick={() => reset(buildServiceFormValues(service))}>Reset</Button>
            </div>
            <Button type="submit" disabled={isSubmitting || updateServiceMutation.isPending}>
              {isSubmitting || updateServiceMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </FormShell>
    </div>
  );
}

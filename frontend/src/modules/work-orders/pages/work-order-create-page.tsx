import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { VehicleModelSelector } from '@/common/components/vehicle/vehicle-model-selector';
import { Textarea } from '@/common/components/ui/textarea';
import { FormShell } from '@/common/components/forms/form-shell';
import { FormDirtyBanner } from '@/common/components/forms/form-dirty-banner';
import { FieldError, FieldHint, FieldLabel } from '@/common/components/forms/form-field';
import { PageHeader } from '@/common/components/page/page-header';
import { useToast } from '@/common/components/feedback/toast-provider';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { useUnsavedChanges } from '@/common/hooks/use-unsaved-changes';
import { useCreateWorkOrder } from '@/modules/work-orders/hooks/use-work-orders';
import {
  buildWorkOrderPayload,
  CAR_WASH_STATUS_OPTIONS,
  getDefaultWorkOrderFormValues,
  PRIORITY_OPTIONS,
  SERVICE_STATUS_OPTIONS,
  WORK_ORDER_STATUS_OPTIONS,
  workOrderSchema,
  type WorkOrderFormValues,
} from '@/modules/work-orders/lib/work-order-form';
import { VEHICLE_CATALOG } from '@/common/lib/vehicle-catalog';
import { getErrorMessage } from '@/common/lib/request-error';

export function WorkOrderCreatePage() {
  const navigate = useNavigate();
  const createWorkOrderMutation = useCreateWorkOrder();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [submitState, setSubmitState] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: getDefaultWorkOrderFormValues(),
  });

  const selectedModel = watch('jenis_mobil');
  const selectedStatus = watch('status');
  const selectedStatusServis = watch('statusServis');
  const selectedPrioritas = watch('prioritas');
  const selectedStatusCuciMobil = watch('statusCuciMobil');

  useUnsavedChanges({ when: isDirty });

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildWorkOrderPayload(values);
    try {
      const created = await createWorkOrderMutation.mutateAsync(payload);
      setSubmitState('Work order berhasil dikirim dan disebarkan ke dashboard lain.');
      showToast({
        title: 'Work order baru',
        description: 'Data work order pusat, pemilik, dan kendaraan berhasil ditambahkan.',
        tone: 'success',
      });
      navigate('/work-orders');
    } catch (error) {
      setSubmitState('Gagal mengirim work order ke server. Tidak ada data lokal yang dibuat.');
      showToast({
        title: 'Gagal menyimpan work order',
        description: getErrorMessage(error, 'Data work order tidak berhasil dikirim ke server. Tidak ada data lokal yang dibuat.'),
        tone: 'error',
      });
    }
  });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Work Order" title="Work Order Baru" />

      <FormShell eyebrow="Form Terpadu" title="Input Work Order" subtitle="Isi seluruh data work order pusat, pemilik, dan kendaraan dalam satu laman sesuai dokumen pusat.">
        <FormDirtyBanner visible={isDirty} />
        <form className="mt-4 space-y-6" onSubmit={onSubmit}>
          <section className="space-y-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel-light)]/40 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] theme-muted">Work Order Pusat</p>
              <h3 className="mt-2 text-xl font-semibold theme-text">Nomor WO, status, prioritas, dan detail servis</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="nomorWoPusat">Nomor Work Order Pusat</FieldLabel>
                <Input id="nomorWoPusat" placeholder="Masukkan nomor work order pusat" {...register('nomorWoPusat')} />
                <FieldError>{errors.nomorWoPusat?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="waktuMasuk">Tanggal / Waktu Input</FieldLabel>
                <Input id="waktuMasuk" type="datetime-local" placeholder="Contoh: 25/12/2025 14:30" {...register('waktuMasuk')} />
                <FieldError>{errors.waktuMasuk?.message}</FieldError>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel-light)]/40 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] theme-muted">Pemilik</p>
              <h3 className="mt-2 text-xl font-semibold theme-text">Data pelanggan / pemilik kendaraan</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="nik">NIK Pemilik</FieldLabel>
                <Input id="nik" placeholder="Masukkan NIK pemilik kendaraan" {...register('nik')} />
                <FieldError>{errors.nik?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="nama">Nama Pemilik</FieldLabel>
                <Input id="nama" placeholder="Masukkan nama lengkap pemilik kendaraan" {...register('nama')} />
                <FieldError>{errors.nama?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="no_hp">No HP</FieldLabel>
                <Input id="no_hp" placeholder="Masukkan nomor HP aktif pemilik" {...register('no_hp')} />
                <FieldError>{errors.no_hp?.message}</FieldError>
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
                <Textarea id="alamat" placeholder="Masukkan alamat lengkap pemilik kendaraan" {...register('alamat')} />
                <FieldError>{errors.alamat?.message}</FieldError>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel-light)]/40 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] theme-muted">Kendaraan</p>
              <h3 className="mt-2 text-xl font-semibold theme-text">Identitas kendaraan pelanggan</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="plat_nomor">Plat Nomor</FieldLabel>
                <Input id="plat_nomor" placeholder="Masukkan nomor plat kendaraan" {...register('plat_nomor')} />
                <FieldError>{errors.plat_nomor?.message}</FieldError>
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="jenis_mobil">Model Kendaraan</FieldLabel>
                <VehicleModelSelector
                  name="jenis_mobil"
                  value={selectedModel}
                  options={VEHICLE_CATALOG}
                  onChange={(value) => setValue('jenis_mobil', value, { shouldDirty: true, shouldValidate: true })}
                />
                <FieldError>{errors.jenis_mobil?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="warna">Warna</FieldLabel>
                <Input id="warna" placeholder="Masukkan warna kendaraan" {...register('warna')} />
                <FieldError>{errors.warna?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="no_rangka">No Rangka / VIN</FieldLabel>
                <Input id="no_rangka" placeholder="Masukkan nomor rangka / VIN kendaraan" {...register('no_rangka')} />
                <FieldError>{errors.no_rangka?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="kilometer">Kilometer</FieldLabel>
                <Input id="kilometer" type="number" placeholder="Masukkan kilometer kendaraan saat ini" {...register('kilometer')} />
                <FieldError>{errors.kilometer?.message}</FieldError>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel-light)]/40 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] theme-muted">Detail Work Order</p>
              <h3 className="mt-2 text-xl font-semibold theme-text">Keluhan, servis, dan status distribusi</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="status">Status Work Order</FieldLabel>
                <Select id="status" className={!selectedStatus ? 'text-[color:var(--muted)]' : undefined} {...register('status')}>
                  <option value="" disabled>
                    Pilih status work order
                  </option>
                  {WORK_ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.status?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="statusServis">Status Servis Awal</FieldLabel>
                <Select id="statusServis" className={!selectedStatusServis ? 'text-[color:var(--muted)]' : undefined} {...register('statusServis')}>
                  <option value="" disabled>
                    Pilih status servis awal
                  </option>
                  {SERVICE_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 'DIKERJAKAN' ? 'PROSES SERVIS' : option === 'TEST_DRIVE' ? 'SIAP TEST DRIVE' : option}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.statusServis?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="prioritas">Prioritas</FieldLabel>
                <Select id="prioritas" className={!selectedPrioritas ? 'text-[color:var(--muted)]' : undefined} {...register('prioritas')}>
                  <option value="" disabled>
                    Pilih prioritas pekerjaan
                  </option>
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.prioritas?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="estimasiSelesai">Estimasi Selesai</FieldLabel>
                <Input id="estimasiSelesai" type="datetime-local" placeholder="Contoh: 25/12/2025 16:00" {...register('estimasiSelesai')} />
              </div>
              <div>
                <FieldLabel htmlFor="statusCuciMobil">Permintaan Cuci Mobil</FieldLabel>
                <Select id="statusCuciMobil" className={!selectedStatusCuciMobil ? 'text-[color:var(--muted)]' : undefined} {...register('statusCuciMobil')}>
                  <option value="" disabled>
                    Pilih kebutuhan cuci mobil
                  </option>
                  {CAR_WASH_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 'TIDAK_PERLU' ? 'Tidak perlu' : option === 'MENUNGGU' ? 'Diminta / menunggu' : 'Sudah selesai'}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.statusCuciMobil?.message}</FieldError>
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="catatanCuciMobil">Catatan Cuci Mobil</FieldLabel>
                <Textarea id="catatanCuciMobil" placeholder="Masukkan catatan tambahan terkait cuci mobil (opsional)" {...register('catatanCuciMobil')} />
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="keluhan">Keluhan / Ringkasan Pekerjaan</FieldLabel>
                <Textarea id="keluhan" placeholder="Masukkan keluhan atau ringkasan pekerjaan pelanggan (opsional)" {...register('keluhan')} />
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="detailServis">Detail Servis</FieldLabel>
                <Textarea id="detailServis" placeholder="Masukkan detail pekerjaan servis (satu baris per item, opsional)" {...register('detailServis')} />
                <FieldHint>Satu baris satu item pekerjaan.</FieldHint>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--line)] pt-4">
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={async () => {
                if (!isDirty) {
                  navigate('/work-orders');
                  return;
                }
                const approved = await confirm({ title: 'Batalkan flow work order?', description: 'Perubahan yang belum disimpan akan hilang.' });
                if (approved) navigate('/work-orders');
              }}>Batal</Button>
              <Button type="button" variant="secondary" onClick={async () => {
                if (!isDirty) {
                  reset();
                  return;
                }
                const approved = await confirm({ title: 'Reset seluruh form?', description: 'Semua data work order, pemilik, dan kendaraan akan dikosongkan.' });
                if (approved) reset(getDefaultWorkOrderFormValues());
              }}>Reset</Button>
            </div>
            <div className="flex items-center gap-3">
              {submitState ? <p className="text-sm theme-muted">{submitState}</p> : null}
              <Button type="submit" disabled={isSubmitting || createWorkOrderMutation.isPending}>{isSubmitting || createWorkOrderMutation.isPending ? 'Menyimpan...' : 'Simpan Work Order'}</Button>
            </div>
          </div>
        </form>
      </FormShell>
    </div>
  );
}

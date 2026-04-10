import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Select } from '@/common/components/ui/select';
import { Textarea } from '@/common/components/ui/textarea';
import { FormShell } from '@/common/components/forms/form-shell';
import { FormDirtyBanner } from '@/common/components/forms/form-dirty-banner';
import { FieldError, FieldHint, FieldLabel } from '@/common/components/forms/form-field';
import { PageHeader } from '@/common/components/page/page-header';
import { useToast } from '@/common/components/feedback/toast-provider';
import { useConfirm } from '@/common/components/feedback/confirm-dialog-provider';
import { useUnsavedChanges } from '@/common/hooks/use-unsaved-changes';
import { useCreateWorkOrder } from '@/modules/work-orders/hooks/use-work-orders';
import { buildWorkOrderPayload, getDefaultWorkOrderFormValues, vehicleOptions, workOrderSchema, type WorkOrderFormValues } from '@/modules/work-orders/lib/work-order-form';
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: getDefaultWorkOrderFormValues(),
  });

  useUnsavedChanges({ when: isDirty });

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildWorkOrderPayload(values);
    try {
      await createWorkOrderMutation.mutateAsync(payload);
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
                <Input id="nomorWoPusat" placeholder="GW-DSB-26030008" {...register('nomorWoPusat')} />
                <FieldError>{errors.nomorWoPusat?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="waktuMasuk">Tanggal / Waktu Input</FieldLabel>
                <Input id="waktuMasuk" type="datetime-local" {...register('waktuMasuk')} />
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
                <Input id="nik" placeholder="3301224406790004" {...register('nik')} />
                <FieldError>{errors.nik?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="nama">Nama Pemilik</FieldLabel>
                <Input id="nama" placeholder="Yunita Sabariah" {...register('nama')} />
                <FieldError>{errors.nama?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="no_hp">No HP</FieldLabel>
                <Input id="no_hp" placeholder="081392937597" {...register('no_hp')} />
                <FieldError>{errors.no_hp?.message}</FieldError>
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
                <Textarea id="alamat" placeholder="Perum. Paradise Blok Y 6, Jatirjo" {...register('alamat')} />
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
                <Input id="plat_nomor" placeholder="AB1257Y" {...register('plat_nomor')} />
                <FieldError>{errors.plat_nomor?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="jenis_mobil">Model Kendaraan</FieldLabel>
                <Select id="jenis_mobil" {...register('jenis_mobil')}>
                  {vehicleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </Select>
                <FieldError>{errors.jenis_mobil?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="warna">Warna</FieldLabel>
                <Input id="warna" placeholder="Pristine White" {...register('warna')} />
                <FieldError>{errors.warna?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="no_rangka">No Rangka / VIN</FieldLabel>
                <Input id="no_rangka" placeholder="MF7HD27B8SJ000180" {...register('no_rangka')} />
                <FieldError>{errors.no_rangka?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="kilometer">Kilometer</FieldLabel>
                <Input id="kilometer" type="number" placeholder="6831" {...register('kilometer')} />
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
                <Select id="status" {...register('status')}>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="statusServis">Status Servis Awal</FieldLabel>
                <Select id="statusServis" {...register('statusServis')}>
                  <option value="ANTRIAN">ANTRIAN</option>
                  <option value="DIKERJAKAN">PROSES SERVIS</option>
                  <option value="TEST_DRIVE">SIAP TEST DRIVE</option>
                  <option value="SELESAI">SELESAI</option>
                  <option value="DIAMBIL">DIAMBIL</option>
                  <option value="TERKENDALA">TERKENDALA</option>
                </Select>
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
                <FieldLabel htmlFor="estimasiSelesai">Estimasi Selesai</FieldLabel>
                <Input id="estimasiSelesai" type="datetime-local" {...register('estimasiSelesai')} />
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
                <FieldLabel htmlFor="keluhan">Keluhan / Ringkasan Pekerjaan</FieldLabel>
                <Textarea id="keluhan" placeholder="Opsional: ringkasan keluhan pelanggan" {...register('keluhan')} />
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="detailServis">Detail Servis</FieldLabel>
                <Textarea id="detailServis" placeholder={'Opsional, satu baris satu item pekerjaan'} {...register('detailServis')} />
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

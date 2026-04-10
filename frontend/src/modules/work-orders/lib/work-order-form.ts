import { z } from 'zod';
import type { WorkOrder } from '@/common/types/domain';
import type { CreateWorkOrderPayload } from '@/modules/work-orders/types/work-order.types';

export const workOrderSchema = z.object({
  nomorWoPusat: z.string().min(3, 'Nomor work order pusat wajib diisi'),
  waktuMasuk: z.string().min(1, 'Tanggal / waktu input wajib diisi'),
  nik: z.string().min(8, 'NIK minimal 8 karakter'),
  nama: z.string().min(3, 'Nama pemilik minimal 3 karakter'),
  no_hp: z.string().min(8, 'Nomor HP wajib diisi'),
  alamat: z.string().min(5, 'Alamat wajib diisi'),
  plat_nomor: z.string().min(3, 'Plat nomor wajib diisi'),
  jenis_mobil: z.string().min(3, 'Model kendaraan wajib dipilih'),
  warna: z.string().min(2, 'Warna wajib diisi'),
  no_rangka: z.string().min(5, 'Nomor rangka minimal 5 karakter'),
  kilometer: z.coerce.number().int().min(0, 'Kilometer tidak boleh negatif'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED']),
  statusServis: z.enum(['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA']),
  prioritas: z.enum(['NORMAL', 'HIGH', 'URGENT']),
  keluhan: z.string().optional(),
  detailServis: z.string().optional(),
  estimasiSelesai: z.string().optional(),
  statusCuciMobil: z.enum(['TIDAK_PERLU', 'MENUNGGU', 'SELESAI']),
  catatanCuciMobil: z.string().optional(),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

export const vehicleOptions = [
  'JAECOO J5 EV PREMIUM',
  'JAECOO J5 EV',
  'JAECOO J5 PHEV',
  'JAECOO J7 SHS-P',
  'JAECOO J7 AWD',
  'JAECOO J8 AWD',
  'JAECOO J8 ARDIS',
  'JAECOO J8 SHS-P ARDIS',
] as const;

function toDatetimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function getDefaultWorkOrderFormValues(): WorkOrderFormValues {
  return {
    nomorWoPusat: '',
    waktuMasuk: '',
    nik: '',
    nama: '',
    no_hp: '',
    alamat: '',
    plat_nomor: '',
    jenis_mobil: 'JAECOO J5 EV PREMIUM',
    warna: '',
    no_rangka: '',
    kilometer: 0,
    status: 'OPEN',
    statusServis: 'ANTRIAN',
    prioritas: 'NORMAL',
    keluhan: '',
    detailServis: '',
    estimasiSelesai: '',
    statusCuciMobil: 'TIDAK_PERLU',
    catatanCuciMobil: '',
  };
}

export function buildWorkOrderFormValues(workOrder: WorkOrder): WorkOrderFormValues {
  const service = workOrder.servis?.[0];
  const vehicle = workOrder.kendaraan;
  const customer = vehicle?.pemilik;

  return {
    nomorWoPusat: workOrder.nomor_wo_pusat ?? '',
    waktuMasuk: toDatetimeLocal(workOrder.waktuMasuk),
    nik: customer?.nik ?? vehicle?.nik_pemilik ?? '',
    nama: customer?.nama ?? '',
    no_hp: customer?.no_hp ?? '',
    alamat: customer?.alamat ?? '',
    plat_nomor: vehicle?.plat_nomor ?? '',
    jenis_mobil: vehicle?.jenis_mobil ?? 'JAECOO J5 EV PREMIUM',
    warna: vehicle?.warna ?? '',
    no_rangka: workOrder.no_rangka ?? vehicle?.no_rangka ?? '',
    kilometer: vehicle?.kilometer ?? 0,
    status: workOrder.status,
    statusServis: service?.status ?? 'ANTRIAN',
    prioritas: service?.prioritas ?? 'NORMAL',
    keluhan: service?.keluhan ?? '',
    detailServis: service?.detail_servis?.map((item) => item.keterangan ?? item.nama_servis ?? '').filter(Boolean).join('\n') ?? '',
    estimasiSelesai: toDatetimeLocal(service?.estimasiSelesai),
    statusCuciMobil: service?.statusCuciMobil ?? 'TIDAK_PERLU',
    catatanCuciMobil: service?.catatanCuciMobil ?? '',
  };
}

export function buildWorkOrderPayload(values: WorkOrderFormValues): CreateWorkOrderPayload {
  return {
    nomor_wo_pusat: values.nomorWoPusat,
    no_rangka: values.no_rangka,
    waktuMasuk: values.waktuMasuk,
    status: values.status,
    customer: {
      nik: values.nik,
      nama: values.nama,
      no_hp: values.no_hp,
      alamat: values.alamat,
    },
    vehicle: {
      no_rangka: values.no_rangka,
      plat_nomor: values.plat_nomor,
      jenis_mobil: values.jenis_mobil,
      warna: values.warna,
      tahun: 2026,
      kilometer: values.kilometer,
      nik_pemilik: values.nik,
    },
    servis: {
      keluhan: values.keluhan?.trim() || '',
      estimasiSelesai: values.estimasiSelesai || null,
      status: values.statusServis,
      prioritas: values.prioritas,
      statusCuciMobil: values.statusCuciMobil,
      catatanCuciMobil: values.catatanCuciMobil?.trim() || null,
    },
    detail_servis: values.detailServis
      ? values.detailServis.split('\n').map((item) => item.trim()).filter(Boolean)
      : [],
  };
}

export function generateLocalIntId(): number {
  const seconds = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1000);
  return Math.min(2147483647, seconds + random);
}

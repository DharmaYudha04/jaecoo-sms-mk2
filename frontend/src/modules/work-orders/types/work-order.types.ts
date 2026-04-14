import type { PriorityLevel, ServiceStatus, WashRequestStatus, WorkOrderStatus } from '@/common/types/domain';

export type WorkOrderPayload = {
  nomor_wo_pusat: string;
  no_rangka: string;
  waktuMasuk: string;
  status: WorkOrderStatus;
  customer: {
    nik: string;
    nama: string;
    no_hp: string;
    alamat: string;
  };
  vehicle: {
    no_rangka: string;
    plat_nomor: string;
    jenis_mobil: string;
    warna: string;
    tahun?: number | null;
    kilometer: number;
    nik_pemilik: string;
  };
  servis: {
    keluhan?: string;
    estimasiSelesai?: string | null;
    status: ServiceStatus;
    prioritas: PriorityLevel;
    statusCuciMobil: WashRequestStatus;
    catatanCuciMobil?: string | null;
  };
  detail_servis?: string[];
};

export type CreateWorkOrderPayload = WorkOrderPayload;
export type UpdateWorkOrderPayload = Partial<WorkOrderPayload> & {
  nomor_wo_pusat: string;
  no_rangka: string;
  waktuMasuk: string;
  status: WorkOrderStatus;
  customer: {
    nik: string;
    nama: string;
    no_hp: string;
    alamat: string;
  };
  vehicle: {
    no_rangka: string;
    plat_nomor: string;
    jenis_mobil: string;
    warna: string;
    tahun?: number | null;
    kilometer: number;
    nik_pemilik: string;
  };
  servis: {
    keluhan?: string;
    estimasiSelesai?: string | null;
    status: ServiceStatus;
    prioritas: PriorityLevel;
    statusCuciMobil: WashRequestStatus;
    catatanCuciMobil?: string | null;
  };
};

export interface WorkOrderListRow {
  code: string;
  unit: string;
  owner: string;
  status: WorkOrderStatus;
}

export interface WorkOrderSummaryCard {
  label: string;
  value: string;
  note: string;
}

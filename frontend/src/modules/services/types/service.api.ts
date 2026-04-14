import type { BackendCustomer } from '@/modules/customers/types/customer.api';
import type { BackendWorkOrder } from '@/modules/work-orders/types/work-order.api';

export interface BackendServiceItem {
  id_detail?: number;
  id_servis?: number;
  id_jenis_servis?: number;
  keterangan?: string | null;
  nama_servis?: string | null;
  jenis_servis?: { nama_servis?: string | null };
}

export interface BackendMechanicNote {
  id_catatan?: number;
  id_servis?: number;
  catatan?: string;
  waktu?: string;
}

export interface BackendServiceHistory {
  id_riwayat?: number;
  id_servis?: number;
  status?: string;
  waktu?: string;
}

export interface BackendService {
  id_servis?: number;
  id_wo?: number;
  keluhan?: string;
  estimasiSelesai?: string | null;
  tanggalSelesai?: string | null;
  status?: string;
  prioritas?: string;
  statusCuciMobil?: string;
  catatanCuciMobil?: string | null;
  createdAt?: string;
  detail_servis?: BackendServiceItem[];
  catatan?: BackendMechanicNote[];
  riwayat?: BackendServiceHistory[];
  workOrder?: BackendWorkOrder;
}

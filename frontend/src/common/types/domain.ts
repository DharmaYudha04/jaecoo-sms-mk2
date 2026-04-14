import type {
  BackendPriorityLevel as PriorityLevel,
  BackendRole as Role,
  BackendServiceStatus as ServiceStatus,
  BackendWorkOrderStatus as WorkOrderStatus,
} from '@/common/types/backend-enums';

export type { PriorityLevel, Role, ServiceStatus, WorkOrderStatus };

export type WashRequestStatus = 'TIDAK_PERLU' | 'MENUNGGU' | 'SELESAI';

export type DeviceNotificationPermission = NotificationPermission | 'unsupported';

export interface User {
  id_user: number;
  fullName?: string | null;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Customer {
  nik: string;
  nama: string;
  no_hp?: string | null;
  alamat?: string | null;
  createdAt: string;
}

export interface Vehicle {
  no_rangka: string;
  plat_nomor: string;
  jenis_mobil?: string | null;
  warna?: string | null;
  tahun?: number | null;
  kilometer: number;
  nik_pemilik: string;
  createdAt: string;
  pemilik?: Customer;
}

export interface MechanicNote {
  id_catatan: number;
  id_servis: number;
  catatan: string;
  waktu: string;
}

export interface ServiceHistory {
  id_riwayat: number;
  id_servis: number;
  status: ServiceStatus;
  waktu: string;
}

export interface ServiceItem {
  id_detail: number;
  id_servis: number;
  id_jenis_servis: number;
  keterangan?: string | null;
  nama_servis?: string | null;
}

export interface WorkOrder {
  id_wo: number;
  nomor_wo_pusat?: string | null;
  waktuMasuk: string;
  status: WorkOrderStatus;
  no_rangka: string;
  kendaraan?: Vehicle;
  servis?: Service[];
}

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  targetPath?: string | null;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
}

export interface Service {
  id_servis: number;
  id_wo: number;
  keluhan: string;
  estimasiSelesai?: string | null;
  tanggalSelesai?: string | null;
  status: ServiceStatus;
  prioritas: PriorityLevel;
  statusCuciMobil: WashRequestStatus;
  catatanCuciMobil?: string | null;
  createdAt: string;
  detail_servis?: ServiceItem[];
  catatan?: MechanicNote[];
  riwayat?: ServiceHistory[];
  workOrder?: WorkOrder;
}

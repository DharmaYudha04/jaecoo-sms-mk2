import type {
  Customer,
  MechanicNote,
  PriorityLevel,
  Role,
  Service,
  ServiceHistory,
  ServiceItem,
  ServiceStatus,
  User,
  Vehicle,
  WashRequestStatus,
  WorkOrder,
  WorkOrderStatus,
} from '@/common/types/domain';
import {
  isBackendPriorityLevel,
  isBackendRole,
  isBackendServiceStatus,
  isBackendWorkOrderStatus,
} from '@/common/lib/backend-contract';

function coerceRole(value: unknown): Role {
  return isBackendRole(value) ? value : 'ADMIN';
}

function coerceServiceStatus(value: unknown): ServiceStatus {
  return isBackendServiceStatus(value) ? value : 'ANTRIAN';
}

function coerceWorkOrderStatus(value: unknown): WorkOrderStatus {
  return isBackendWorkOrderStatus(value) ? value : 'OPEN';
}

function coercePriority(value: unknown): PriorityLevel {
  return isBackendPriorityLevel(value) ? value : 'NORMAL';
}

function coerceWashRequestStatus(value: unknown): WashRequestStatus {
  return value === 'MENUNGGU' || value === 'SELESAI' ? value : 'TIDAK_PERLU';
}

export function mapUserFromBackend(input: Record<string, unknown>): User {
  return {
    id_user: Number(input.id_user ?? 0),
    email: String(input.email ?? ''),
    role: coerceRole(input.role),
    isActive: Boolean(input.isActive ?? true),
  };
}

export function mapCustomerFromBackend(input: Record<string, unknown>): Customer {
  return {
    nik: String(input.nik ?? ''),
    nama: String(input.nama ?? ''),
    no_hp: input.no_hp == null ? null : String(input.no_hp),
    alamat: input.alamat == null ? null : String(input.alamat),
    createdAt: String(input.createdAt ?? ''),
  };
}

export function mapVehicleFromBackend(input: Record<string, unknown>): Vehicle {
  return {
    no_rangka: String(input.no_rangka ?? ''),
    plat_nomor: String(input.plat_nomor ?? ''),
    jenis_mobil: input.jenis_mobil == null ? null : String(input.jenis_mobil),
    warna: input.warna == null ? null : String(input.warna),
    tahun: input.tahun == null ? null : Number(input.tahun),
    kilometer: Number(input.kilometer ?? 0),
    nik_pemilik: String(input.nik_pemilik ?? ''),
    createdAt: String(input.createdAt ?? ''),
    pemilik: input.pemilik && typeof input.pemilik === 'object'
      ? mapCustomerFromBackend(input.pemilik as Record<string, unknown>)
      : undefined,
  };
}

export function mapMechanicNoteFromBackend(input: Record<string, unknown>): MechanicNote {
  return {
    id_catatan: Number(input.id_catatan ?? 0),
    id_servis: Number(input.id_servis ?? 0),
    catatan: String(input.catatan ?? ''),
    waktu: String(input.waktu ?? ''),
  };
}

export function mapServiceHistoryFromBackend(input: Record<string, unknown>): ServiceHistory {
  return {
    id_riwayat: Number(input.id_riwayat ?? 0),
    id_servis: Number(input.id_servis ?? 0),
    status: coerceServiceStatus(input.status),
    waktu: String(input.waktu ?? ''),
  };
}

export function mapServiceItemFromBackend(input: Record<string, unknown>): ServiceItem {
  const nestedJenis = input.jenis_servis && typeof input.jenis_servis === 'object'
    ? (input.jenis_servis as Record<string, unknown>).nama_servis
    : undefined;

  return {
    id_detail: Number(input.id_detail ?? 0),
    id_servis: Number(input.id_servis ?? 0),
    id_jenis_servis: Number(input.id_jenis_servis ?? 0),
    keterangan: input.keterangan == null ? null : String(input.keterangan),
    nama_servis: input.nama_servis == null && nestedJenis == null ? null : String(input.nama_servis ?? nestedJenis),
  };
}

export function mapWorkOrderFromBackend(input: Record<string, unknown>): WorkOrder {
  return {
    id_wo: Number(input.id_wo ?? 0),
    nomor_wo_pusat: input.nomor_wo_pusat == null ? null : String(input.nomor_wo_pusat),
    waktuMasuk: String(input.waktuMasuk ?? ''),
    status: coerceWorkOrderStatus(input.status),
    no_rangka: String(input.no_rangka ?? ''),
    kendaraan: input.kendaraan && typeof input.kendaraan === 'object'
      ? mapVehicleFromBackend(input.kendaraan as Record<string, unknown>)
      : undefined,
    servis: Array.isArray(input.servis)
      ? input.servis.map((item) => mapServiceFromBackend(item as Record<string, unknown>, false))
      : undefined,
  };
}

export function mapServiceFromBackend(input: Record<string, unknown>, includeWorkOrder = true): Service {
  const detailServis = Array.isArray(input.detail_servis)
    ? input.detail_servis.map((item) => mapServiceItemFromBackend(item as Record<string, unknown>))
    : undefined;

  const catatan = Array.isArray(input.catatan)
    ? input.catatan.map((item) => mapMechanicNoteFromBackend(item as Record<string, unknown>))
    : undefined;

  const riwayat = Array.isArray(input.riwayat)
    ? input.riwayat.map((item) => mapServiceHistoryFromBackend(item as Record<string, unknown>))
    : undefined;

  return {
    id_servis: Number(input.id_servis ?? 0),
    id_wo: Number(input.id_wo ?? 0),
    keluhan: String(input.keluhan ?? ''),
    estimasiSelesai: input.estimasiSelesai == null ? null : String(input.estimasiSelesai),
    tanggalSelesai: input.tanggalSelesai == null ? null : String(input.tanggalSelesai),
    status: coerceServiceStatus(input.status),
    prioritas: coercePriority(input.prioritas),
    statusCuciMobil: coerceWashRequestStatus(input.statusCuciMobil),
    catatanCuciMobil: input.catatanCuciMobil == null ? null : String(input.catatanCuciMobil),
    createdAt: String(input.createdAt ?? ''),
    detail_servis: detailServis,
    catatan,
    riwayat,
    workOrder: includeWorkOrder && input.workOrder && typeof input.workOrder === 'object'
      ? mapWorkOrderFromBackend(input.workOrder as Record<string, unknown>)
      : undefined,
  };
}

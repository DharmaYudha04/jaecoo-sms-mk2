import type { PriorityLevel, ServiceStatus, WashRequestStatus } from '@/common/types/domain';

export interface UpdateServicePayload {
  keluhan: string;
  estimasiSelesai?: string | null;
  status: ServiceStatus;
  prioritas: PriorityLevel;
  statusCuciMobil: WashRequestStatus;
  catatanCuciMobil?: string | null;
  detail_servis?: string[];
}

export interface UpdateServiceStatusPayload {
  status: ServiceStatus;
  note?: string;
}

export interface ServiceFilter {
  status?: ServiceStatus;
  priority?: PriorityLevel;
  keyword?: string;
  mechanicId?: number;
}

export interface CreateServicePayload {
  id_wo: number;
  keluhan: string;
  estimasiSelesai?: string | null;
  status?: ServiceStatus;
  prioritas?: PriorityLevel;
  statusCuciMobil?: WashRequestStatus;
  catatanCuciMobil?: string | null;
}

export interface CreateMechanicNotePayload {
  catatan: string;
}

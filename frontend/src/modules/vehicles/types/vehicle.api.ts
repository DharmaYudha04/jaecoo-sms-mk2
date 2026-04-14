import type { BackendCustomer } from '@/modules/customers/types/customer.api';

export interface BackendVehicle {
  no_rangka?: string;
  plat_nomor?: string;
  jenis_mobil?: string | null;
  warna?: string | null;
  tahun?: number | null;
  kilometer?: number;
  nik_pemilik?: string;
  createdAt?: string;
  pemilik?: BackendCustomer;
}

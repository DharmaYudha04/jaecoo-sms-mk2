import type { BackendService } from '@/modules/services/types/service.api';
import type { BackendVehicle } from '@/modules/vehicles/types/vehicle.api';

export interface BackendWorkOrder {
  id_wo?: number;
  nomor_wo_pusat?: string | null;
  waktuMasuk?: string;
  status?: string;
  no_rangka?: string;
  kendaraan?: BackendVehicle;
  servis?: BackendService[];
}

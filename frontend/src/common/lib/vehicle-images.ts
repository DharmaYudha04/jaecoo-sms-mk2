import { getVehicleCatalogItemByModel } from '@/common/lib/vehicle-catalog';

export type VehicleImageMatch = {
  src: string;
  alt: string;
};

export function getVehicleImageByModel(model?: string | null): VehicleImageMatch {
  const item = getVehicleCatalogItemByModel(model);
  return item.image;
}

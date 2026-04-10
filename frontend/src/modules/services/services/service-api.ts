import { unwrapApiCollection, unwrapApiSingle } from '@/common/lib/api-response';
import type { Service } from '@/common/types/domain';
import { mapServiceFromBackend } from '@/common/lib/backend-mappers';
import type { BackendService } from '@/modules/services/types/service.api';
import type {
  CreateMechanicNotePayload,
  CreateServicePayload,
  UpdateServicePayload,
  UpdateServiceStatusPayload,
} from '@/modules/services/types/service.types';
import { apiClient } from '@/services/api-client';
import { endpoints } from '@/services/endpoints';

export async function getServices(): Promise<Service[]> {
  const { data } = await apiClient.get<BackendService[] | { data?: BackendService[] }>(endpoints.services.list);
  return unwrapApiCollection(data).map((item) => mapServiceFromBackend(item as Record<string, unknown>));
}

export async function getServiceDetail(serviceId: string): Promise<Service> {
  const { data } = await apiClient.get<BackendService | { data?: BackendService }>(endpoints.services.detail(serviceId));
  return mapServiceFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
  const { data } = await apiClient.post<BackendService | { data?: BackendService }>(endpoints.services.create, payload);
  return mapServiceFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function updateService(serviceId: string, payload: UpdateServicePayload): Promise<Service> {
  const { data } = await apiClient.patch<BackendService | { data?: BackendService }>(endpoints.services.update(serviceId), payload);
  return mapServiceFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function updateServiceStatus(serviceId: string, payload: UpdateServiceStatusPayload): Promise<Service> {
  const { data } = await apiClient.patch<BackendService | { data?: BackendService }>(endpoints.services.status(serviceId), payload);
  return mapServiceFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function createMechanicNote(serviceId: string, payload: CreateMechanicNotePayload) {
  const { data } = await apiClient.post<Record<string, unknown>>(endpoints.services.notes(serviceId), payload);
  return data;
}

export async function deleteService(serviceId: string) {
  const { data } = await apiClient.delete<Record<string, unknown>>(endpoints.services.detail(serviceId));
  return data;
}

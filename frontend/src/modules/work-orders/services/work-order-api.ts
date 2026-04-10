import { unwrapApiCollection, unwrapApiSingle } from '@/common/lib/api-response';
import { mapWorkOrderFromBackend } from '@/common/lib/backend-mappers';
import type { WorkOrder } from '@/common/types/domain';
import type { BackendWorkOrder } from '@/modules/work-orders/types/work-order.api';
import type { CreateWorkOrderPayload, UpdateWorkOrderPayload } from '@/modules/work-orders/types/work-order.types';
import { apiClient } from '@/services/api-client';
import { endpoints } from '@/services/endpoints';

export async function getWorkOrders(): Promise<WorkOrder[]> {
  const { data } = await apiClient.get<BackendWorkOrder[] | { data?: BackendWorkOrder[] }>(endpoints.workOrders.list);
  return unwrapApiCollection(data).map((item) => mapWorkOrderFromBackend(item as Record<string, unknown>));
}

export async function getWorkOrderDetail(id: string | number): Promise<WorkOrder> {
  const { data } = await apiClient.get<BackendWorkOrder | { data?: BackendWorkOrder }>(endpoints.workOrders.detail(id));
  return mapWorkOrderFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function createWorkOrder(payload: CreateWorkOrderPayload): Promise<WorkOrder> {
  const { data } = await apiClient.post<BackendWorkOrder | { data?: BackendWorkOrder }>(endpoints.workOrders.create, payload);
  return mapWorkOrderFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function updateWorkOrder(id: string | number, payload: UpdateWorkOrderPayload): Promise<WorkOrder> {
  const { data } = await apiClient.patch<BackendWorkOrder | { data?: BackendWorkOrder }>(endpoints.workOrders.update(id), payload);
  return mapWorkOrderFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function deleteWorkOrder(id: string | number): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(endpoints.workOrders.delete(id));
  return data;
}

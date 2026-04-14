import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query-keys';
import { createWorkOrder, deleteWorkOrder, getWorkOrderDetail, getWorkOrders, updateWorkOrder } from '@/modules/work-orders/services/work-order-api';

export function useWorkOrders() {
  return useQuery({
    queryKey: queryKeys.workOrders,
    queryFn: getWorkOrders,
  });
}

export function useWorkOrderDetail(id: string | number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.workOrderDetail(id),
    queryFn: () => getWorkOrderDetail(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
}

export function useUpdateWorkOrder(id: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateWorkOrder>[1]) => updateWorkOrder(id, payload),
    onSuccess: (workOrder) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      void queryClient.setQueryData(queryKeys.workOrderDetail(workOrder.id_wo), workOrder);
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteWorkOrder(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
}

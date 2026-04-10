import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query-keys';
import {
  createMechanicNote,
  createService,
  deleteService,
  getServiceDetail,
  getServices,
  updateService,
  updateServiceStatus,
} from '@/modules/services/services/service-api';

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: getServices,
  });
}

export function useServiceDetail(serviceId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.serviceDetail(serviceId),
    queryFn: () => getServiceDetail(serviceId),
    enabled: options?.enabled ?? Boolean(serviceId),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createService,
    onSuccess: (service) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.setQueryData(queryKeys.serviceDetail(service.id_servis), service);
    },
  });
}

export function useUpdateService(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateService>[1]) => updateService(serviceId, payload),
    onSuccess: (service) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.setQueryData(queryKeys.serviceDetail(service.id_servis), service);
    },
  });
}

export function useUpdateServiceStatus(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateServiceStatus>[1]) => updateServiceStatus(serviceId, payload),
    onSuccess: (service) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.setQueryData(queryKeys.serviceDetail(service.id_servis), service);
    },
  });
}

export function useCreateMechanicNote(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createMechanicNote>[1]) => createMechanicNote(serviceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.serviceDetail(serviceId) });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => deleteService(serviceId),
    onSuccess: (_, serviceId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.serviceDetail(serviceId) });
    },
  });
}

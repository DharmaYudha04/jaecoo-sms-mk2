import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ActivityLogFilters } from '@/modules/audit/types/audit.types';
import { clearActivityLogs, getActivityLogs } from '@/modules/audit/services/audit-api';
import { queryKeys } from '@/services/query-keys';

export function useActivityLogs(filters: ActivityLogFilters) {
  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => getActivityLogs(filters),
  });
}

export function useClearActivityLogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearActivityLogs,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

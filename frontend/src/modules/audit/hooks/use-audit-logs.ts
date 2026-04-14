import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ActivityLogFilters, ActivityLog } from '@/modules/audit/types/audit.types';
import { clearActivityLogs, getActivityLogs } from '@/modules/audit/services/audit-api';
import { dismissItem } from '@/common/lib/dismissed-items';
import { queryKeys } from '@/services/query-keys';

export function useActivityLogs(filters: ActivityLogFilters) {
  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => getActivityLogs(filters),
  });
}

export function useDismissActivityLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      dismissItem('activity-logs', id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueriesData<ActivityLog[]>({ queryKey: ['audit-logs'] }, (current) => {
        if (!Array.isArray(current)) return current;
        return current.filter((item) => item.id !== id);
      });
    },
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

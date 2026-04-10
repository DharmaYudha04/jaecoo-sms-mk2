import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/query-keys';
import { createUser, deleteUser, getUsers, updateUser } from '@/modules/users/services/user-api';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: getUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Parameters<typeof updateUser>[1] }) => updateUser(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

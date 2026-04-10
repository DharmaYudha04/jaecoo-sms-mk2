import { unwrapApiCollection, unwrapApiSingle } from '@/common/lib/api-response';
import { mapUserFromBackend } from '@/common/lib/backend-mappers';
import type { User } from '@/common/types/domain';
import type { BackendUser } from '@/modules/users/types/user.api';
import type { CreateUserPayload, UpdateUserPayload } from '@/modules/users/types/user.types';
import { apiClient } from '@/services/api-client';
import { endpoints } from '@/services/endpoints';

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<BackendUser[] | { data?: BackendUser[] }>(endpoints.users.list);
  return unwrapApiCollection(data).map((item) => mapUserFromBackend(item as Record<string, unknown>));
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<BackendUser | { data?: BackendUser }>(endpoints.users.create, payload);
  return mapUserFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function updateUser(id: string | number, payload: UpdateUserPayload): Promise<User> {
  const { data } = await apiClient.patch<BackendUser | { data?: BackendUser }>(endpoints.users.update(id), payload);
  return mapUserFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

export async function deleteUser(id: string | number): Promise<User> {
  const { data } = await apiClient.delete<BackendUser | { data?: BackendUser }>(endpoints.users.delete(id));
  return mapUserFromBackend(unwrapApiSingle(data) as Record<string, unknown>);
}

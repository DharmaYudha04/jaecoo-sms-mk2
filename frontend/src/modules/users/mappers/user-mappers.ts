import { isBackendRole } from '@/common/lib/backend-contract';
import type { User } from '@/common/types/domain';
import type { BackendUser } from '@/modules/users/types/user.api';
import type { UserListRow } from '@/modules/users/types/user.types';

export function mapUserFromApi(input: BackendUser): User {
  return {
    id_user: Number(input.id_user ?? 0),
    email: String(input.email ?? ''),
    role: isBackendRole(input.role) ? input.role : 'ADMIN',
    isActive: Boolean(input.isActive ?? true),
  };
}

export function mapUserToListRow(input: User): UserListRow {
  return {
    email: input.email,
    role: input.role,
    status: input.isActive ? 'Aktif' : 'Nonaktif',
  };
}

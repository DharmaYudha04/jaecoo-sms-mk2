import type { Role } from '@/common/types/domain';

export interface CreateUserPayload {
  email: string;
  password: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  role?: Role;
  isActive?: boolean;
  password?: string;
}

export interface UserListRow {
  email: string;
  role: Role;
  status: string;
}

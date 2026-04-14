import type { Role } from '@/common/types/domain';

export interface CreateUserPayload {
  fullName?: string;
  email: string;
  password: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
  password?: string;
}

export interface UserListRow {
  fullName: string;
  email: string;
  role: Role;
  status: string;
}

import { apiClient } from '@/services/api-client';
import { mapUserFromBackend } from '@/common/lib/backend-mappers';
import type { Role, User } from '@/common/types/domain';
import type { LoginPayload, LoginResponse } from '@/modules/auth/types/auth.types';
import type { BackendLoginResponse } from '@/modules/auth/types/auth.api';

const enableDemoAuth = (import.meta.env.VITE_ENABLE_DEMO_AUTH ?? 'false') === 'true';

type DemoCredential = {
  email: string;
  password: string;
  user: User;
};

const demoUsers: DemoCredential[] = [
  {
    email: 'admin@service.com',
    password: 'Admin123!',
    user: { id_user: 1, fullName: 'Admin Service', email: 'admin@service.com', role: 'ADMIN', isActive: true },
  },
  {
    email: 'frontline@service.com',
    password: 'Frontline123!',
    user: { id_user: 2, fullName: 'Frontline Service', email: 'frontline@service.com', role: 'FRONTLINE', isActive: true },
  },
  {
    email: 'manager@service.com',
    password: 'Manager123!',
    user: { id_user: 3, fullName: 'Manager Service', email: 'manager@service.com', role: 'MANAGER', isActive: true },
  },
  {
    email: 'mechanic@service.com',
    password: 'Mechanic123!',
    user: { id_user: 4, fullName: 'Mekanik Service', email: 'mechanic@service.com', role: 'MEKANIK', isActive: true },
  },
];

function createMockResponse(user: User): LoginResponse {
  return {
    accessToken: `demo-token-${user.role.toLowerCase()}`,
    user,
  };
}

function findDemoUser(payload: LoginPayload): DemoCredential | undefined {
  return demoUsers.find(
    (item) => item.email.toLowerCase() === payload.email.toLowerCase() && item.password === payload.password,
  );
}

function inferRoleFromEmail(email: string): Role {
  const value = email.toLowerCase();
  if (value.includes('mechanic') || value.includes('mekanik')) return 'MEKANIK';
  if (value.includes('frontline') || value.includes('frontdesk')) return 'FRONTLINE';
  if (value.includes('manager') || value.includes('manajer')) return 'MANAGER';
  return 'ADMIN';
}

async function loginWithDemo(payload: LoginPayload): Promise<LoginResponse> {
  const matchedUser = findDemoUser(payload);

  if (!matchedUser) {
    throw new Error(
      'Login demo gagal. Gunakan manager@service.com / Manager123! atau pilih akun demo di halaman login.',
    );
  }

  return createMockResponse(matchedUser.user);
}

async function loginWithBackend(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<BackendLoginResponse>('/auth/login', payload);
  return {
    accessToken: data.accessToken,
    user: mapUserFromBackend(data.user),
  };
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<Record<string, unknown>>('/auth/me');
  return mapUserFromBackend(data);
}

export async function login(payload: LoginPayload) {
  if (enableDemoAuth && findDemoUser(payload)) {
    return loginWithDemo(payload);
  }

  return loginWithBackend(payload);
}

export const demoCredentials = enableDemoAuth
  ? demoUsers.map(({ email, password, user }) => ({
      email,
      password,
      role: user.role,
    }))
  : [];

export function createQuickDemoSession(email = 'manager@service.com'): LoginResponse {
  if (!enableDemoAuth) {
    throw new Error('Demo auth nonaktif di environment ini.');
  }

  const role = inferRoleFromEmail(email);
  const demoUser = demoUsers.find((item) => item.user.role === role) ?? demoUsers[0];
  return createMockResponse({
    ...demoUser.user,
    email,
  });
}

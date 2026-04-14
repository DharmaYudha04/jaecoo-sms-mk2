import { create } from 'zustand';
import { User } from '@/common/types/domain';
import { authStorage } from '@/services/auth-storage';
import { getCurrentUser } from '@/modules/auth/services/auth-api';

type AuthState = {
  token: string | null;
  user: User | null;
  rememberMe: boolean;
  isBootstrapping: boolean;
  setSession: (payload: { token: string; user: User; rememberMe?: boolean }) => void;
  clearSession: () => void;
  bootstrapSession: () => Promise<void>;
};

const persisted = authStorage.get();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: persisted?.token ?? null,
  user: (persisted?.user as User | null) ?? null,
  rememberMe: persisted?.rememberMe ?? true,
  isBootstrapping: false,
  setSession: ({ token, user, rememberMe = true }) => {
    authStorage.save({ token, user, rememberMe }, rememberMe ? 'local' : 'session');
    set({ token, user, rememberMe, isBootstrapping: false });
  },
  clearSession: () => {
    authStorage.clear();
    set({ token: null, user: null, rememberMe: true, isBootstrapping: false });
  },
  bootstrapSession: async () => {
    const { token, rememberMe, isBootstrapping } = get();

    if (isBootstrapping) {
      return;
    }

    if (!token) {
      set({ isBootstrapping: false, user: null });
      return;
    }

    set({ isBootstrapping: true });

    try {
      const currentUser = await getCurrentUser();
      authStorage.save({ token, user: currentUser, rememberMe }, rememberMe ? 'local' : 'session');
      set({ user: currentUser, isBootstrapping: false });
    } catch {
      authStorage.clear();
      set({ token: null, user: null, rememberMe: true, isBootstrapping: false });
    }
  },
}));

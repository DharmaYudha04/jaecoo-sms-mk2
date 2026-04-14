import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { login } from '@/modules/auth/services/auth-api';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { authStorage } from '@/services/auth-storage';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (data, variables) => {
      setSession({ token: data.accessToken, user: data.user, rememberMe: variables.rememberMe ?? true });

      if (variables.rememberMe ?? true) {
        authStorage.saveLastEmail(variables.email);
      } else {
        authStorage.clearLastEmail();
      }
    },
    throwOnError: false,
    meta: {
      friendlyErrorMessage: 'Gagal masuk ke sistem.',
    },
  });
}

export function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Terjadi kesalahan saat memproses login.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan saat memproses login.';
}

import { PropsWithChildren, useEffect } from 'react';
import { useAuthStore } from '@/modules/auth/store/auth-store';

export function AuthBootstrap({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    if (!token) {
      return;
    }

    void bootstrapSession();
  }, [bootstrapSession, token]);

  return children;
}

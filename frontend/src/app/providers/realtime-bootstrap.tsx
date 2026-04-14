import type { PropsWithChildren } from 'react';
import { useRealtimeEvents } from '@/common/hooks/use-realtime-events';
import { useAuthStore } from '@/modules/auth/store/auth-store';

export function RealtimeBootstrap({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  useRealtimeEvents(Boolean(token));
  return <>{children}</>;
}

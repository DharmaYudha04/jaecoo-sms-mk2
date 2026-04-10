import { PropsWithChildren } from 'react';
import { useRealtimeEvents } from '@/common/hooks/use-realtime-events';
import { useAuthStore } from '@/modules/auth/store/auth-store';

export function RealtimeBootstrap({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user);
  useRealtimeEvents(Boolean(user));
  return <>{children}</>;
}

import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/common/theme/theme-provider';
import { ToastProvider } from '@/common/components/feedback/toast-provider';
import { ConfirmDialogProvider } from '@/common/components/feedback/confirm-dialog-provider';
import { AuthBootstrap } from '@/app/providers/auth-bootstrap';
import { RealtimeBootstrap } from '@/app/providers/realtime-bootstrap';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: ONE_DAY_MS,
      retry: 1,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <AuthBootstrap>
              <RealtimeBootstrap>{children}</RealtimeBootstrap>
            </AuthBootstrap>
          </ConfirmDialogProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

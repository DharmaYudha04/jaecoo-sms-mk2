import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/common/theme/theme-provider';
import { ToastProvider } from '@/common/components/feedback/toast-provider';
import { ConfirmDialogProvider } from '@/common/components/feedback/confirm-dialog-provider';
import { AuthBootstrap } from '@/app/providers/auth-bootstrap';
import { RealtimeBootstrap } from '@/app/providers/realtime-bootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
      refetchOnWindowFocus: true,
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

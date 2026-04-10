import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Card } from '@/common/components/ui/card';
import { useLogin, getErrorMessage } from '@/modules/auth/hooks/use-login';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { getDefaultRouteByRole, roleLabels } from '@/common/lib/authz';
import { ThemeLogo } from '@/common/components/ui/theme-logo';
import { useToast } from '@/common/components/feedback/toast-provider';
import { cn } from '@/common/utils/cn';
import { authStorage } from '@/services/auth-storage';
import { LoadingState } from '@/common/components/feedback/loading-state';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
      <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
      <path d="M9.88 5.12A11.3 11.3 0 0 1 12 4.95c6 0 9.75 7.05 9.75 7.05a18.8 18.8 0 0 1-3.42 4.41" />
      <path d="M6.6 6.6A18.4 18.4 0 0 0 2.25 12s3.75 6.75 9.75 6.75a10.7 10.7 0 0 0 3.53-.59" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const rememberSession = useAuthStore((state) => state.rememberMe);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const loginMutation = useLogin();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const hasShownLoginSuccessToast = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: authStorage.getLastEmail(),
      password: '',
      rememberMe: rememberSession,
    },
  });

  const rememberMe = watch('rememberMe');
  const checkboxTone = useMemo(
    () =>
      cn(
        'flex h-5 w-5 items-center justify-center rounded-md border transition duration-200',
        rememberMe
          ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--background)] shadow-[0_0_0_4px_rgba(255,255,255,0.04)]'
          : 'border-[color:var(--line)] bg-[color:var(--panel-light)] text-transparent hover:border-[color:var(--accent)]/70',
      ),
    [rememberMe],
  );

  useEffect(() => {
    if (!token || !user || isBootstrapping) {
      return;
    }

    const targetPath = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;

    if (loginMutation.isSuccess && !hasShownLoginSuccessToast.current) {
      hasShownLoginSuccessToast.current = true;
      showToast({ title: 'Login berhasil', description: `Role aktif: ${roleLabels[user.role]}.`, tone: 'success' });
    }

    navigate(targetPath ?? getDefaultRouteByRole(user.role), { replace: true });
  }, [isBootstrapping, location.state, loginMutation.isSuccess, navigate, token, user, showToast]);

  const errorMessage = loginMutation.isError ? getErrorMessage(loginMutation.error) : null;

  if (isBootstrapping && token) {
    return <LoadingState message="Menyiapkan sesi anda..." rows={2} />;
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6 lg:hidden">
        <ThemeLogo alt="JAECOO" className="h-7 w-auto" />
      </div>

      <Card className="rounded-[30px] p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] theme-muted">JAECOO YOGYAKARTA | SERVICE MANAGEMENT SYSTEM</p>
            <h1 className="mt-3 text-3xl font-semibold text-gradient">Masuk</h1>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] theme-muted">Email</label>
            <Input placeholder="Masukkan email anda disini!" autoComplete="email" {...register('email')} />
            {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] theme-muted">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi anda disini!"
                autoComplete="current-password"
                className="pr-14"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-1.5 right-1.5 flex h-[calc(100%-0.75rem)] items-center justify-center rounded-xl border border-transparent px-3 text-[color:var(--muted)] transition duration-200 hover:border-[color:var(--line)] hover:bg-[color:var(--panel)] hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                aria-pressed={showPassword}
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className="group flex w-full items-center justify-between rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-light)] px-4 py-3 text-left transition duration-200 hover:border-[color:var(--accent)]/60 hover:bg-[color:var(--panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/35"
                aria-pressed={field.value}
              >
                <div className="flex items-center gap-3">
                  <span className={checkboxTone}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
                      <path d="m3.5 8.5 2.5 2.5 6-6" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-[color:var(--text)]">Ingat Saya</span>
                  </span>
                </div>
                <span className="rounded-full border border-[color:var(--line)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] theme-muted transition duration-200 group-hover:border-[color:var(--accent)]/50 group-hover:text-[color:var(--text)]">
                  {field.value ? 'Aktif' : 'Mati'}
                </span>
              </button>
            )}
          />

          {errorMessage && <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

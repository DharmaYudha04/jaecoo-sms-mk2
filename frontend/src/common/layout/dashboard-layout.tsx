import { FormEvent, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { appRoutes } from '@/config/route.config';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { Button } from '@/common/components/ui/button';
import { ThemeToggle } from '@/common/components/ui/theme-toggle';
import { Card } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { SearchIcon } from '@/common/components/ui/action-icons';
import { hasPermission, roleLabels } from '@/common/lib/authz';
import { ThemeLogo } from '@/common/components/ui/theme-logo';
import { RouteTransitionOutlet } from '@/common/components/navigation/route-transition-outlet';
import { useBroadcastUnreadCount, useNotificationUnreadCount, useNotifications } from '@/modules/notifications/hooks/use-notifications';
import { requestBrowserNotificationPermission, useBrowserNotifications } from '@/common/lib/browser-notifications';
import { getPreferredDisplayName } from '@/common/lib/display-name';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const latestNotificationsQuery = useNotifications({ sort: 'newest' });
  const unreadNotificationsQuery = useNotificationUnreadCount();
  const unreadBroadcastsQuery = useBroadcastUnreadCount();
  useBrowserNotifications(latestNotificationsQuery.data);

  const unreadNotificationCount = unreadNotificationsQuery.data ?? 0;
  const unreadBroadcastCount = unreadBroadcastsQuery.data ?? 0;
  const displayName = getPreferredDisplayName(user);

  const submitGlobalSearch = (event: FormEvent) => {
    event.preventDefault();
    const keyword = searchValue.trim();
    navigate(keyword ? `/work-orders?search=${encodeURIComponent(keyword)}` : '/work-orders');
    setOpen(false);
  };

  const allowedRoutes = useMemo(
    () => appRoutes.filter((route) => hasPermission(user?.role, route.permission)),
    [user?.role],
  );

  const currentRoute = allowedRoutes.find((item) => location.pathname.startsWith(item.path));

  const badgeCountByPath: Record<string, number> = {
    '/notifications': unreadNotificationCount,
    '/broadcasts': unreadBroadcastCount,
  };

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <Link to="/dashboard" className="glass-soft rounded-[24px] p-4 xl:p-5" onClick={() => setOpen(false)}>
        <ThemeLogo alt="JAECOO" className="h-7 w-auto opacity-95 xl:h-8" />
        <div className="mt-3 max-w-[190px] space-y-0.5">
          <p className="sidebar-title text-[clamp(0.98rem,1.08vw,1.34rem)] font-semibold leading-[1.08] theme-text">
            <span className="block">Yogyakarta</span>
            <span className="block">Service</span>
            <span className="block">Management</span>
          </p>
        </div>
      </Link>

      <Card className="mt-4 p-3.5 xl:p-4">
        <p className="text-[11px] uppercase tracking-[0.28em] theme-muted">Akun</p>
        <p className="mt-2 text-base font-semibold theme-text xl:text-lg">{displayName}</p>
        <p className="mt-1 break-all text-sm theme-muted">{user?.email}</p>
        <p className="mt-1 text-sm text-gradient-accent">{roleLabels[user?.role ?? 'ADMIN']}</p>
      </Card>

      <nav className="sidebar-nav mt-4 flex-1 space-y-2 overflow-y-auto pr-1 text-left">
        {allowedRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === '/dashboard'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              [
                'group relative block overflow-hidden rounded-[22px] border px-3.5 py-3.5 transition duration-300 xl:px-4 xl:py-4',
                isActive
                  ? 'theme-line bg-[linear-gradient(135deg,var(--accent-soft),color-mix(in_srgb,var(--panel-light)_82%,transparent))] shadow-[0_18px_42px_rgba(0,0,0,0.12)]'
                  : 'border-transparent bg-transparent hover:border-[color:var(--line)] hover:bg-[color:var(--panel-light)]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <div className="flex w-full items-center justify-start gap-3 text-left">
                <span
                  className={[
                    'h-2.5 w-2.5 rounded-full transition duration-200',
                    isActive ? 'bg-[color:var(--accent)] shadow-[0_0_0_6px_var(--accent-soft)]' : 'bg-[color:var(--muted)]/35 group-hover:bg-[color:var(--accent)]/70',
                  ].join(' ')}
                />
                <p className={['text-[0.95rem] font-semibold leading-6', isActive ? 'theme-text' : 'theme-muted'].join(' ')}>{route.label}</p>
                {badgeCountByPath[route.path] ? (
                  <span className="ml-auto inline-flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_0_0_4px_rgba(239,68,68,0.18)]">
                    {badgeCountByPath[route.path]}
                  </span>
                ) : null}
                {isActive && <span className="ml-2 h-8 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[color:var(--line)]/80 pt-4 text-left">
        {hasPermission(user?.role, 'work-orders:create') ? (
          <Button onClick={() => {
            setOpen(false);
            navigate('/work-orders/new');
          }}>
            Tambah Work Order Baru +
          </Button>
        ) : null}
        <Button
          variant="ghost"
          className="logout-button"
          onClick={() => {
            clearSession();
            navigate('/login', { replace: true });
          }}
        >
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="relative min-h-screen bg-[color:var(--bg)]/10">
        <div className="flex min-h-screen items-start">
          <aside className="fixed inset-y-0 left-0 hidden w-[320px] shrink-0 p-4 xl:w-[336px] lg:block">
            <div className="glass-mobile h-[calc(100vh-2rem)] overflow-hidden rounded-[30px] p-4 xl:p-5">{sidebar}</div>
          </aside>

          {open && (
            <div className="fixed inset-0 z-50 bg-black/45 lg:hidden" onClick={() => setOpen(false)}>
              <aside className="glass-mobile h-full w-[86%] max-w-[320px] overflow-hidden rounded-r-[30px] p-5" onClick={(event) => event.stopPropagation()}>
                {sidebar}
              </aside>
            </div>
          )}

          <div className="min-w-0 flex-1 lg:ml-[320px] xl:ml-[336px]">
            <header className="sticky top-0 z-30 px-4 py-4 md:px-6 xl:px-8">
              <div className="topbar-surface glass-soft mx-auto max-w-full rounded-[26px] border px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.14)] sm:px-4 md:px-5">
                <div className="flex flex-nowrap items-center gap-2 md:gap-3">
                  <div className="flex min-w-0 items-center gap-2 md:gap-3">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-light)] text-xl theme-text lg:hidden"
                      onClick={() => setOpen(true)}
                      aria-label="Buka navigasi"
                    >
                      ☰
                    </button>
                    <div className="min-w-0 max-w-[140px] sm:max-w-[190px] md:max-w-[220px]">
                      <p className="truncate text-[11px] uppercase tracking-[0.22em] theme-muted max-sm:hidden">JAECOO Yogyakarta</p>
                      <h1 className="truncate text-sm font-medium theme-text md:text-base">{currentRoute?.label ?? 'Dashboard'}</h1>
                    </div>
                  </div>

                  <form onSubmit={submitGlobalSearch} className="ml-auto flex min-w-0 flex-1 items-center gap-2 md:max-w-[440px]">
                    <Input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Cari WO, nama, plat, HP, model..." className="min-w-0" />
                    <Button type="submit" variant="secondary" className="action-icon-button shrink-0" aria-label="Telusuri">
                      <SearchIcon className="h-4 w-4" />
                    </Button>
                  </form>

                  <Button variant="secondary" className="shrink-0 px-3 max-sm:text-[13px]" onClick={() => navigate('/services')}>Board</Button>
                  <Button
                    variant="secondary"
                    className="relative shrink-0 px-3 max-sm:text-[13px]"
                    onClick={async () => {
                      await requestBrowserNotificationPermission();
                      navigate('/notifications');
                    }}
                  >
                    <span className="max-sm:hidden">Notifikasi</span>
                    <span className="sm:hidden">Notif</span>
                    {unreadNotificationCount ? (
                      <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {unreadNotificationCount}
                      </span>
                    ) : null}
                  </Button>
                  <ThemeToggle className="shrink-0 max-sm:px-2.5" />
                </div>
              </div>
            </header>

            <main className="page-shell">
              <RouteTransitionOutlet routeKey={location.pathname} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

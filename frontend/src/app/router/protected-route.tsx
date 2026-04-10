import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { canAccessPath, getDefaultRouteByRole } from '@/common/lib/authz';
import { LoadingState } from '@/common/components/feedback/loading-state';

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const location = useLocation();

  if (isBootstrapping && token) {
    return <LoadingState message="Menyiapkan sesi anda..." rows={2} />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessPath(user.role, location.pathname)) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
  }

  return <Outlet />;
}

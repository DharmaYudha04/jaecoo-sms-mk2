import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppErrorPage } from '@/common/components/feedback/app-error-page';
import { LoadingState } from '@/common/components/feedback/loading-state';
import { AuthLayout } from '@/common/layout/auth-layout';
import { DashboardLayout } from '@/common/layout/dashboard-layout';
import { ProtectedRoute } from '@/app/router/protected-route';

const LandingPage = lazy(() => import('@/modules/landing/pages/landing-page'));
const LoginPage = lazy(() => import('@/modules/auth/pages/login-page').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })));
const WorkOrderListPage = lazy(() => import('@/modules/work-orders/pages/work-order-list-page').then((m) => ({ default: m.WorkOrderListPage })));
const WorkOrderCreatePage = lazy(() => import('@/modules/work-orders/pages/work-order-create-page').then((m) => ({ default: m.WorkOrderCreatePage })));
const WorkOrderEditPage = lazy(() => import('@/modules/work-orders/pages/work-order-edit-page').then((m) => ({ default: m.WorkOrderEditPage })));
const ServiceBoardPage = lazy(() => import('@/modules/services/pages/service-board-page').then((m) => ({ default: m.ServiceBoardPage })));
const ServiceStatusPage = lazy(() => import('@/modules/services/pages/service-status-page').then((m) => ({ default: m.ServiceStatusPage })));
const ServiceDetailPage = lazy(() => import('@/modules/services/pages/service-detail-page').then((m) => ({ default: m.ServiceDetailPage })));
const UserManagementPage = lazy(() => import('@/modules/users/pages/user-management-page').then((m) => ({ default: m.UserManagementPage })));
const UserCreatePage = lazy(() => import('@/modules/users/pages/user-create-page').then((m) => ({ default: m.UserCreatePage })));
const NotificationPage = lazy(() => import('@/modules/notifications/pages/notification-page').then((m) => ({ default: m.NotificationPage })));
const BroadcastPage = lazy(() => import('@/modules/notifications/pages/broadcast-page').then((m) => ({ default: m.BroadcastPage })));
const ActivityLogPage = lazy(() => import('@/modules/audit/pages/activity-log-page').then((m) => ({ default: m.ActivityLogPage })));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<LoadingState message="Memuat halaman..." rows={2} />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  { path: '/', element: withSuspense(<LandingPage />), errorElement: <AppErrorPage /> },
  {
    path: '/login',
    element: <AuthLayout />,
    errorElement: <AppErrorPage />,
    children: [{ index: true, element: withSuspense(<LoginPage />) }],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <AppErrorPage />,
    children: [
      { path: 'app', element: <Navigate to="/dashboard" replace /> },
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          {
            path: 'work-orders',
            children: [
              { index: true, element: withSuspense(<WorkOrderListPage />) },
              { path: 'new', element: withSuspense(<WorkOrderCreatePage />) },
              { path: ':workOrderId/edit', element: withSuspense(<WorkOrderEditPage />) },
            ],
          },
          {
            path: 'services',
            children: [
              { index: true, element: withSuspense(<ServiceBoardPage />) },
              { path: 'status/:status', element: withSuspense(<ServiceStatusPage />) },
              { path: ':serviceId', element: withSuspense(<ServiceDetailPage />) },
            ],
          },
          {
            path: 'users',
            children: [
              { index: true, element: withSuspense(<UserManagementPage />) },
              { path: 'new', element: withSuspense(<UserCreatePage />) },
            ],
          },
          { path: 'notifications', element: withSuspense(<NotificationPage />) },
          { path: 'broadcasts', element: withSuspense(<BroadcastPage />) },
          { path: 'audit', element: withSuspense(<ActivityLogPage />) },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

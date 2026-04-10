import { useMemo } from 'react';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { DashboardHeroSection } from '@/modules/dashboard/components/dashboard-hero-section';
import { DashboardStatusOverview } from '@/modules/dashboard/components/dashboard-status-overview';
import { DashboardWorkOrderSection } from '@/modules/dashboard/components/dashboard-work-order-section';
import { getDashboardConfigByRole } from '@/modules/dashboard/lib/dashboard-config-role';
import { hasAnyUnseen } from '@/common/lib/unseen-notifications';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';
import type { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';
import type { Role, Service } from '@/common/types/domain';
import { useServices } from '@/modules/services/hooks/use-services';
import { useWorkOrders } from '@/modules/work-orders/hooks/use-work-orders';
import { useUsers } from '@/modules/users/hooks/use-users';
import { buildWorkOrderRecords } from '@/modules/work-orders/lib/work-order-records';

function buildMonitoringCards(role: Role | undefined, activeWorkOrders: number, vehiclesInProcess: number, activeUsers: number, statusCounts: DashboardConfig['statusCounts']): DashboardConfig['monitoringCards'] {
  if (role === 'FRONTLINE') {
    return [
      { label: 'Work Order Aktif', value: String(activeWorkOrders), note: 'Pantauan intake dan komunikasi pelanggan.', tone: 'info', href: '/work-orders', unseenSection: 'work-orders' },
      { label: 'Antrian Masuk', value: String(statusCounts.ANTRIAN), note: 'Unit baru yang perlu ditindaklanjuti di meja depan.', tone: 'warning', href: '/services/status/ANTRIAN', unseenSection: 'services', unseenStatus: 'ANTRIAN' },
      { label: 'Siap Diserahkan', value: String(statusCounts.SELESAI), note: 'Unit selesai yang siap diinformasikan ke pelanggan.', tone: 'success', href: '/services/status/SELESAI', unseenSection: 'services', unseenStatus: 'SELESAI' },
    ];
  }
  if (role === 'MEKANIK') {
    return [
      { label: 'Antrian Unit', value: String(statusCounts.ANTRIAN), note: 'Unit yang menunggu masuk workshop.', tone: 'info', href: '/services/status/ANTRIAN', unseenSection: 'services', unseenStatus: 'ANTRIAN' },
      { label: 'Sedang Dikerjakan', value: String(statusCounts.DIKERJAKAN), note: 'Unit yang sedang diproses mekanik.', tone: 'success', href: '/services/status/DIKERJAKAN', unseenSection: 'services', unseenStatus: 'DIKERJAKAN' },
      { label: 'Terkendala', value: String(statusCounts.TERKENDALA), note: 'Unit yang perlu keputusan atau tindak lanjut.', tone: 'warning', href: '/services/status/TERKENDALA', unseenSection: 'services', unseenStatus: 'TERKENDALA' },
    ];
  }
  return [
    { label: 'Work Order Aktif', value: String(activeWorkOrders), note: 'Semua work order yang masih aktif dan belum ditutup.', tone: 'info', href: '/work-orders', unseenSection: 'work-orders' },
    { label: 'Kendaraan Diproses', value: String(vehiclesInProcess), note: 'Tahap antrian, dikerjakan, test drive, atau terkendala.', tone: 'success', href: '/services', unseenSection: 'services' },
    { label: 'User Aktif', value: String(activeUsers), note: 'Akun aktif yang mendukung operasional.', tone: 'warning', href: '/users' },
  ];
}

export function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role);
  const baseConfig = getDashboardConfigByRole(role);
  const servicesQuery = useServices();
  const workOrdersQuery = useWorkOrders();
  const usersQuery = useUsers();
  useUnseenRefresh();

  const serviceItems = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const workOrderItems = useMemo(() => workOrdersQuery.data ?? [], [workOrdersQuery.data]);
  const userItems = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const config = useMemo<DashboardConfig>(() => {
    const nextConfig = structuredClone(baseConfig);
    const statusCounts = serviceItems.reduce<Record<Service['status'], number>>(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      { ANTRIAN: 0, DIKERJAKAN: 0, TEST_DRIVE: 0, SELESAI: 0, DIAMBIL: 0, TERKENDALA: 0 },
    );
    nextConfig.statusCounts = statusCounts;

    const activeWorkOrders = workOrderItems.filter((item) => item.status === 'OPEN' || item.status === 'IN_PROGRESS').length;
    const vehiclesInProcess = serviceItems.filter((item) => ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'TERKENDALA'].includes(item.status)).length;
    const activeUsers = userItems.filter((item) => item.isActive).length;

    nextConfig.monitoringCards = buildMonitoringCards(role, activeWorkOrders, vehiclesInProcess, activeUsers, statusCounts);

    nextConfig.activeList = buildWorkOrderRecords({ workOrders: workOrderItems, services: serviceItems, vehicles: [], customers: [] })
      .map((record) => {
        const linkedService = record.service;
        const href = linkedService ? `/services/${linkedService.id_servis}` : `/work-orders?search=${encodeURIComponent(record.workOrderCode)}`;
        return {
          wo: record.workOrderCode,
          plate: record.vehicle?.plat_nomor ?? record.workOrder.no_rangka,
          model: record.vehicle?.jenis_mobil ?? 'Belum ada model',
          status: linkedService?.status ?? 'ANTRIAN',
          time: record.workOrder.waktuMasuk ? new Date(record.workOrder.waktuMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          href,
          isNew: hasAnyUnseen(role, record.workOrder.id_wo),
        };
      })
      .filter((item) => {
        if (role === 'FRONTLINE') return ['ANTRIAN', 'SELESAI', 'TERKENDALA', 'DIKERJAKAN', 'DIAMBIL'].includes(item.status);
        if (role === 'MEKANIK') return ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'TERKENDALA'].includes(item.status);
        return true;
      })
      .slice(0, 4);
    return nextConfig;
  }, [baseConfig, role, serviceItems, userItems, workOrderItems]);

  return (
    <div className="space-y-5">
      <DashboardHeroSection config={config} services={serviceItems} workOrders={workOrderItems} />
      <DashboardStatusOverview config={config} services={serviceItems} />
      <DashboardWorkOrderSection config={config} workOrderIds={workOrderItems.map((item) => item.id_wo)} />
    </div>
  );
}


import { useMemo } from 'react';
import { useAuthStore } from '@/modules/auth/store/auth-store';
import { DashboardHeroSection } from '@/modules/dashboard/components/dashboard-hero-section';
import { DashboardStatusOverview } from '@/modules/dashboard/components/dashboard-status-overview';
import { DashboardQuickActions } from '@/modules/dashboard/components/dashboard-quick-actions';
import { DashboardWorkOrderSection } from '@/modules/dashboard/components/dashboard-work-order-section';
import { DashboardPrioritySection } from '@/modules/dashboard/components/dashboard-priority-section';
import { getDashboardConfigByRole } from '@/modules/dashboard/lib/dashboard-config-role';
import { hasAnyUnseen } from '@/common/lib/unseen-notifications';
import { useUnseenRefresh } from '@/common/hooks/use-unseen-refresh';
import type { DashboardConfig } from '@/modules/dashboard/types/dashboard.types';
import type { Role, Service, User, WorkOrder, ServiceStatus } from '@/common/types/domain';
import { useServices } from '@/modules/services/hooks/use-services';
import { useBroadcastUnreadCount, useNotificationUnreadCount } from '@/modules/notifications/hooks/use-notifications';
import { useWorkOrders } from '@/modules/work-orders/hooks/use-work-orders';
import { useUsers } from '@/modules/users/hooks/use-users';
import { buildWorkOrderRecords } from '@/modules/work-orders/lib/work-order-records';

function buildMonitoringCards(role: Role | undefined, activeWorkOrders: number, activeUsers: number, statusCounts: DashboardConfig['statusCounts']): DashboardConfig['monitoringCards'] {
  const selesaiHariIni = statusCounts.SELESAI;

  if (role === 'MEKANIK') {
    return [
      { label: 'Work Order Aktif', value: String(activeWorkOrders), note: 'Pekerjaan yang sedang berjalan dan perlu Anda pantau.', tone: 'info', href: '/work-orders', unseenSection: 'work-orders' },
      { label: 'Terkendala', value: String(statusCounts.TERKENDALA), note: 'Unit yang membutuhkan perhatian segera di workshop.', tone: 'danger', href: '/services/status/TERKENDALA', unseenSection: 'services', unseenStatus: 'TERKENDALA' },
      { label: 'Siap Test Drive', value: String(statusCounts.TEST_DRIVE), note: 'Unit yang sudah masuk tahap QC atau uji jalan.', tone: 'warning', href: '/services/status/TEST_DRIVE', unseenSection: 'services', unseenStatus: 'TEST_DRIVE' },
      { label: 'Selesai Hari Ini', value: String(selesaiHariIni), note: 'Unit yang selesai dikerjakan dan siap diproses lanjut.', tone: 'success', href: '/services/status/SELESAI', unseenSection: 'services', unseenStatus: 'SELESAI' },
    ];
  }

  if (role === 'FRONTLINE') {
    return [
      { label: 'Work Order Aktif', value: String(activeWorkOrders), note: 'Intake dan tindak lanjut unit yang masih berjalan hari ini.', tone: 'info', href: '/work-orders', unseenSection: 'work-orders' },
      { label: 'Terkendala', value: String(statusCounts.TERKENDALA), note: 'Unit yang butuh eskalasi atau informasi cepat ke pelanggan.', tone: 'danger', href: '/services/status/TERKENDALA', unseenSection: 'services', unseenStatus: 'TERKENDALA' },
      { label: 'Siap Test Drive', value: String(statusCounts.TEST_DRIVE), note: 'Unit yang siap QC, test drive, atau konfirmasi lanjutan.', tone: 'warning', href: '/services/status/TEST_DRIVE', unseenSection: 'services', unseenStatus: 'TEST_DRIVE' },
      { label: 'Selesai Hari Ini', value: String(selesaiHariIni), note: 'Unit selesai yang siap diinfokan atau diserahkan ke pelanggan.', tone: 'success', href: '/services/status/SELESAI', unseenSection: 'services', unseenStatus: 'SELESAI' },
    ];
  }

  if (role === 'ADMIN') {
    return [
      { label: 'Work Order Aktif', value: String(activeWorkOrders), note: 'Work order yang masih terbuka dan perlu dijaga sinkron datanya.', tone: 'info', href: '/work-orders', unseenSection: 'work-orders' },
      { label: 'Terkendala', value: String(statusCounts.TERKENDALA), note: 'Unit atau proses yang membutuhkan tindak lanjut cepat.', tone: 'danger', href: '/services/status/TERKENDALA', unseenSection: 'services', unseenStatus: 'TERKENDALA' },
      { label: 'Siap Test Drive', value: String(statusCounts.TEST_DRIVE), note: 'Unit yang masuk tahap akhir sebelum penyelesaian atau serah terima.', tone: 'warning', href: '/services/status/TEST_DRIVE', unseenSection: 'services', unseenStatus: 'TEST_DRIVE' },
      { label: 'Selesai Hari Ini', value: String(selesaiHariIni), note: `Output layanan hari ini dengan ${activeUsers} user aktif yang mendukung operasional.`, tone: 'success', href: '/services/status/SELESAI', unseenSection: 'services', unseenStatus: 'SELESAI' },
    ];
  }

  return [
    { label: 'Work Order Aktif', value: String(activeWorkOrders), note: 'Semua work order yang masih berjalan dan perlu keputusan lanjutan.', tone: 'info', href: '/work-orders', unseenSection: 'work-orders' },
    { label: 'Terkendala', value: String(statusCounts.TERKENDALA), note: 'Unit yang membutuhkan perhatian segera dari sisi operasional.', tone: 'danger', href: '/services/status/TERKENDALA', unseenSection: 'services', unseenStatus: 'TERKENDALA' },
    { label: 'Siap Test Drive', value: String(statusCounts.TEST_DRIVE), note: 'Unit yang menunggu QC, test drive, atau keputusan akhir.', tone: 'warning', href: '/services/status/TEST_DRIVE', unseenSection: 'services', unseenStatus: 'TEST_DRIVE' },
    { label: 'Selesai Hari Ini', value: String(selesaiHariIni), note: 'Unit yang selesai dikerjakan dan siap masuk tahap serah terima.', tone: 'success', href: '/services/status/SELESAI', unseenSection: 'services', unseenStatus: 'SELESAI' },
  ];
}

const priorityWeights: Record<ServiceStatus, number> = {
  TERKENDALA: 100,
  TEST_DRIVE: 90,
  ANTRIAN: 80,
  DIKERJAKAN: 60,
  SELESAI: 40,
  DIAMBIL: 10,
};

export function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role);
  const baseConfig = getDashboardConfigByRole(role);
  const servicesQuery = useServices();
  const workOrdersQuery = useWorkOrders();
  const usersQuery = useUsers();
  const notificationUnreadQuery = useNotificationUnreadCount();
  const broadcastUnreadQuery = useBroadcastUnreadCount();
  useUnseenRefresh();

  const serviceItems = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const workOrderItems = useMemo(() => workOrdersQuery.data ?? [], [workOrdersQuery.data]);
  const userItems = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const notificationUnreadCount = notificationUnreadQuery.data ?? 0;
  const broadcastUnreadCount = broadcastUnreadQuery.data ?? 0;

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
    const activeUsers = userItems.filter((item) => item.isActive).length;
    nextConfig.quickActions = [
      { label: 'Work Order', note: 'Kelola data work order.', href: '/work-orders', badgeCount: activeWorkOrders },
      { label: 'Board Servis', note: 'Pantau status unit servis.', href: '/services', badgeCount: serviceItems.length },
      { label: 'Notifikasi', note: 'Lihat notifikasi terbaru.', href: '/notifications', badgeCount: notificationUnreadCount },
      { label: 'Broadcast', note: 'Lihat pengumuman operasional.', href: '/broadcasts', badgeCount: broadcastUnreadCount },
    ];
    nextConfig.monitoringCards = buildMonitoringCards(role, activeWorkOrders, activeUsers, statusCounts);

    const allRecords = buildWorkOrderRecords({ workOrders: workOrderItems, services: serviceItems, vehicles: [], customers: [] })
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
          rawTime: record.workOrder.waktuMasuk ? new Date(record.workOrder.waktuMasuk).getTime() : 0,
        };
      })
      .filter((item) => {
        if (role === 'FRONTLINE') return ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA'].includes(item.status);
        if (role === 'MEKANIK') return ['ANTRIAN', 'DIKERJAKAN', 'TEST_DRIVE', 'SELESAI', 'DIAMBIL', 'TERKENDALA'].includes(item.status);
        return true;
      })
      .sort((a, b) => b.rawTime - a.rawTime);

    nextConfig.activeList = allRecords
      .slice(0, 20)
      .map(({ rawTime, ...item }) => item);

    nextConfig.priorityList = allRecords
      .filter((item) => ['ANTRIAN', 'TEST_DRIVE', 'TERKENDALA', 'SELESAI'].includes(item.status))
      .sort((a, b) => {
        const left = priorityWeights[a.status] ?? 0;
        const right = priorityWeights[b.status] ?? 0;
        if (left !== right) return right - left;
        return b.rawTime - a.rawTime;
      })
      .slice(0, 6)
      .map((item) => ({
        title: `${item.wo} • ${item.plate}`,
        status: item.status,
        note: item.model,
        href: item.href,
      }));

    return nextConfig;
  }, [baseConfig, role, serviceItems, userItems, workOrderItems, notificationUnreadCount, broadcastUnreadCount]);

  return (
    <div className="space-y-5">
      <DashboardHeroSection config={config} services={serviceItems} workOrders={workOrderItems} />
      <DashboardQuickActions config={config} />
      <DashboardStatusOverview config={config} services={serviceItems} />
      <DashboardPrioritySection config={config} />
      <DashboardWorkOrderSection config={config} workOrderIds={workOrderItems.map((item) => item.id_wo)} />
    </div>
  );
}

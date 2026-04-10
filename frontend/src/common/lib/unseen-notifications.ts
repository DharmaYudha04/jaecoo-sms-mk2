import type { Role, Service, ServiceStatus } from '@/common/types/domain';

export type NotificationSection = 'work-orders' | 'services';

export function markWorkOrderCreated(_id: number, _creatorRole?: Role | null) {}
export function markWorkOrderUpdated(_id: number, _creatorRole?: Role | null) {}
export function markServiceUpdated(_workOrderId: number, _creatorRole?: Role | null) {}
export function getUnseenIds(_role: Role | null | undefined, _section: NotificationSection) { return []; }
export function getUnseenCount(_role: Role | null | undefined, _section: NotificationSection) { return 0; }
export function getValidUnseenIds(_role: Role | null | undefined, _section: NotificationSection, _validIds: number[]) { return []; }
export function getValidUnseenCount(_role: Role | null | undefined, _section: NotificationSection, _validIds: number[]) { return 0; }
export function hasUnseen(_role: Role | null | undefined, _section: NotificationSection, _id: number) { return false; }
export function hasAnyUnseen(_role: Role | null | undefined, _id: number) { return false; }
export function getUnseenServiceStatusCounts(_role: Role | null | undefined, _services: Service[]): Record<ServiceStatus, number> {
  return {
    ANTRIAN: 0,
    DIKERJAKAN: 0,
    TEST_DRIVE: 0,
    SELESAI: 0,
    DIAMBIL: 0,
    TERKENDALA: 0,
  };
}
export function markItemsSeen(_role: Role | null | undefined, _ids: number[], _sections: NotificationSection[] = ['work-orders', 'services']) {}
export function pruneUnseenIds(_role: Role | null | undefined, _section: NotificationSection, _validIds: number[]) {}
export function pruneAllUnseenIds(_role: Role | null | undefined, _validIdsBySection: Partial<Record<NotificationSection, number[]>>) {}
export function clearSection(_role: Role | null | undefined, _section: NotificationSection) {}
export function subscribeToUnseenChanges(_listener: () => void) { return () => undefined; }

import type { Role, Service, ServiceStatus } from '@/common/types/domain';

const STORAGE_KEY = 'jaecoo.unseen.notifications';
const CHANGE_EVENT = 'jaecoo:unseen-notifications';
const roles: Role[] = ['ADMIN', 'MANAGER', 'FRONTLINE', 'MEKANIK'];
export type NotificationSection = 'work-orders' | 'services';

type UnseenState = Record<Role, Record<NotificationSection, number[]>>;

function buildEmpty(): UnseenState {
  return {
    ADMIN: { 'work-orders': [], services: [] },
    MANAGER: { 'work-orders': [], services: [] },
    FRONTLINE: { 'work-orders': [], services: [] },
    MEKANIK: { 'work-orders': [], services: [] },
  };
}

function normalizeIds(ids: number[]) {
  return Array.from(new Set(ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))));
}

function emitChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function readState(): UnseenState {
  if (typeof window === 'undefined') return buildEmpty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildEmpty();
    const parsed = JSON.parse(raw) as Partial<UnseenState>;
    return {
      ADMIN: {
        'work-orders': normalizeIds(parsed.ADMIN?.['work-orders'] ?? []),
        services: normalizeIds(parsed.ADMIN?.services ?? []),
      },
      MANAGER: {
        'work-orders': normalizeIds(parsed.MANAGER?.['work-orders'] ?? []),
        services: normalizeIds(parsed.MANAGER?.services ?? []),
      },
      FRONTLINE: {
        'work-orders': normalizeIds(parsed.FRONTLINE?.['work-orders'] ?? []),
        services: normalizeIds(parsed.FRONTLINE?.services ?? []),
      },
      MEKANIK: {
        'work-orders': normalizeIds(parsed.MEKANIK?.['work-orders'] ?? []),
        services: normalizeIds(parsed.MEKANIK?.services ?? []),
      },
    };
  } catch {
    return buildEmpty();
  }
}

function writeState(state: UnseenState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emitChange();
}

function markUnseenForOtherRoles(id: number, creatorRole?: Role | null, sections: NotificationSection[] = ['work-orders', 'services']) {
  const state = readState();
  roles.forEach((role) => {
    if (role === creatorRole) return;
    sections.forEach((section) => {
      state[role][section] = normalizeIds([id, ...state[role][section]]);
    });
  });
  writeState(state);
}

export function markWorkOrderCreated(id: number, creatorRole?: Role | null) {
  markUnseenForOtherRoles(id, creatorRole, ['work-orders', 'services']);
}

export function markWorkOrderUpdated(id: number, creatorRole?: Role | null) {
  markUnseenForOtherRoles(id, creatorRole, ['work-orders', 'services']);
}

export function markServiceUpdated(workOrderId: number, creatorRole?: Role | null) {
  markUnseenForOtherRoles(workOrderId, creatorRole, ['work-orders', 'services']);
}

export function getUnseenIds(role: Role | null | undefined, section: NotificationSection) {
  if (!role) return [];
  return readState()[role][section];
}

export function getUnseenCount(role: Role | null | undefined, section: NotificationSection) {
  return getUnseenIds(role, section).length;
}

export function getValidUnseenIds(
  role: Role | null | undefined,
  section: NotificationSection,
  validIds: number[],
) {
  const validIdSet = new Set(normalizeIds(validIds));
  return getUnseenIds(role, section).filter((id) => validIdSet.has(id));
}

export function getValidUnseenCount(
  role: Role | null | undefined,
  section: NotificationSection,
  validIds: number[],
) {
  return getValidUnseenIds(role, section, validIds).length;
}

export function hasUnseen(role: Role | null | undefined, section: NotificationSection, id: number) {
  return getUnseenIds(role, section).includes(id);
}

export function hasAnyUnseen(role: Role | null | undefined, id: number) {
  return hasUnseen(role, 'work-orders', id) || hasUnseen(role, 'services', id);
}

export function getUnseenServiceStatusCounts(role: Role | null | undefined, services: Service[]): Record<ServiceStatus, number> {
  const unseenIds = new Set(getUnseenIds(role, 'services'));
  const counts: Record<ServiceStatus, number> = {
    ANTRIAN: 0,
    DIKERJAKAN: 0,
    TEST_DRIVE: 0,
    SELESAI: 0,
    DIAMBIL: 0,
    TERKENDALA: 0,
  };
  services.forEach((service) => {
    if (!unseenIds.has(service.id_wo)) return;
    counts[service.status] += 1;
  });
  return counts;
}

export function markItemsSeen(
  role: Role | null | undefined,
  ids: number[],
  sections: NotificationSection[] = ['work-orders', 'services'],
) {
  if (!role || ids.length === 0) return;
  const targetIds = new Set(normalizeIds(ids));
  const state = readState();
  sections.forEach((section) => {
    state[role][section] = state[role][section].filter((id) => !targetIds.has(id));
  });
  writeState(state);
}


export function pruneUnseenIds(
  role: Role | null | undefined,
  section: NotificationSection,
  validIds: number[],
) {
  if (!role) return;
  const normalizedValidIds = normalizeIds(validIds);
  const state = readState();
  const nextIds = getValidUnseenIds(role, section, normalizedValidIds);
  const currentIds = state[role][section];

  if (currentIds.length === nextIds.length && currentIds.every((id, index) => id === nextIds[index])) return;

  state[role][section] = nextIds;
  writeState(state);
}

export function pruneAllUnseenIds(
  role: Role | null | undefined,
  validIdsBySection: Partial<Record<NotificationSection, number[]>>,
) {
  if (!role) return;
  const state = readState();
  let changed = false;

  (Object.entries(validIdsBySection) as Array<[NotificationSection, number[] | undefined]>).forEach(([section, validIds]) => {
    if (!validIds) return;
    const nextIds = getValidUnseenIds(role, section, validIds);
    const currentIds = state[role][section];

    if (currentIds.length === nextIds.length && currentIds.every((id, index) => id === nextIds[index])) return;

    state[role][section] = nextIds;
    changed = true;
  });

  if (changed) writeState(state);
}

export function clearSection(role: Role | null | undefined, section: NotificationSection) {
  if (!role) return;
  const state = readState();
  state[role][section] = [];
  writeState(state);
}

export function subscribeToUnseenChanges(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => listener();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

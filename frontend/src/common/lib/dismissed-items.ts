const PREFIX = 'jaecoo-dismissed';

type Namespace = 'notifications' | 'broadcasts' | 'activity-logs';

function getStorageKey(namespace: Namespace) {
  return `${PREFIX}:${namespace}`;
}

export function getDismissedItemIds(namespace: Namespace): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(getStorageKey(namespace));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  } catch {
    return [];
  }
}

export function setDismissedItemIds(namespace: Namespace, ids: number[]) {
  if (typeof window === 'undefined') return;
  const normalized = Array.from(new Set(ids.map((value) => Number(value)).filter((value) => Number.isFinite(value))));
  window.localStorage.setItem(getStorageKey(namespace), JSON.stringify(normalized));
}

export function dismissItem(namespace: Namespace, id: number) {
  const current = getDismissedItemIds(namespace);
  if (current.includes(id)) return;
  setDismissedItemIds(namespace, [...current, id]);
}

export function clearDismissedItems(namespace: Namespace) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getStorageKey(namespace));
}

export function filterDismissedItems<T extends { id: number }>(namespace: Namespace, items: T[]) {
  const hidden = new Set(getDismissedItemIds(namespace));
  return items.filter((item) => !hidden.has(item.id));
}

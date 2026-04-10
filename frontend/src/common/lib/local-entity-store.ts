export type Key = 'users' | 'customers' | 'vehicles' | 'work-orders' | 'services' | 'schedules';

export function getLocalEntities<T>(): T[] {
  return [];
}
export function appendLocalEntity<T>(_key: Key, _value: T) {}
export function writeLocalEntities<T>(_key: Key, _value: T[]) {}
export function removeLocalEntity<T>(_key: Key, _getId: (item: T) => string | number, _targetId: string | number) {}
export function mergeEntities<T>(base: T[]): T[] {
  return base;
}
export function useLocalEntities<T>(): T[] {
  return [];
}
export function notifyLocalEntitiesChanged(_key: Key) {}

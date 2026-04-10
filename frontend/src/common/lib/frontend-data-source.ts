export function getCollectionFromMode<T>(_key: never, backendItems: T[] | undefined): T[] {
  return backendItems ?? [];
}

export function getReferenceCollection<T>(): T[] {
  return [];
}

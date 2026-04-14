import type { ApiCollectionResponse, ApiSingleResponse } from '@/common/types/api';

export function unwrapApiCollection<T>(input: ApiCollectionResponse<T>): T[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (Array.isArray(input.data)) {
    return input.data;
  }

  if (Array.isArray(input.items)) {
    return input.items;
  }

  if (Array.isArray(input.results)) {
    return input.results;
  }

  return [];
}

export function unwrapApiSingle<T>(input: ApiSingleResponse<T>): T {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const record = input as { data?: T; item?: T; result?: T };

    if (record.data !== undefined) return record.data;
    if (record.item !== undefined) return record.item;
    if (record.result !== undefined) return record.result;
  }

  return input as T;
}

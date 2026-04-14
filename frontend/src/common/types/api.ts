export type ApiCollectionResponse<T> = T[] | { data?: T[]; items?: T[]; results?: T[] };

export type ApiSingleResponse<T> = T | { data?: T; item?: T; result?: T };

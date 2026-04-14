import { authConfig } from '@/config/auth.config';

type AuthPersistence = 'local' | 'session';

type AuthPayload = {
  token: string | null;
  user: unknown | null;
  rememberMe?: boolean;
};

const storages: Array<{ key: AuthPersistence; storage: Storage }> = [
  { key: 'local', storage: window.localStorage },
  { key: 'session', storage: window.sessionStorage },
];

function readFromStorage(storage: Storage): AuthPayload | null {
  const raw = storage.getItem(authConfig.storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    storage.removeItem(authConfig.storageKey);
    return null;
  }
}

export const authStorage = {
  get(): AuthPayload | null {
    for (const entry of storages) {
      const payload = readFromStorage(entry.storage);
      if (payload) {
        return payload;
      }
    }
    return null;
  },
  save(payload: AuthPayload, persistence: AuthPersistence = 'local') {
    this.clear();
    const target = persistence === 'session' ? window.sessionStorage : window.localStorage;
    target.setItem(authConfig.storageKey, JSON.stringify({ ...payload, rememberMe: persistence === 'local' }));
  },
  getToken() {
    return this.get()?.token ?? null;
  },
  getLastEmail() {
    return window.localStorage.getItem(authConfig.lastEmailStorageKey) ?? '';
  },
  saveLastEmail(email: string) {
    const value = email.trim();
    if (!value) {
      window.localStorage.removeItem(authConfig.lastEmailStorageKey);
      return;
    }

    window.localStorage.setItem(authConfig.lastEmailStorageKey, value);
  },
  clearLastEmail() {
    window.localStorage.removeItem(authConfig.lastEmailStorageKey);
  },
  clear() {
    for (const entry of storages) {
      entry.storage.removeItem(authConfig.storageKey);
    }
  },
};

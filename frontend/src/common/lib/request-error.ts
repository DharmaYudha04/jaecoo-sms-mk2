import axios from 'axios';

function joinMessages(input: unknown): string | null {
  if (Array.isArray(input)) {
    const items = input.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
    return items.length ? items.join(' ') : null;
  }
  return typeof input === 'string' && input.trim() ? input.trim() : null;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message = joinMessages(data?.message) ?? joinMessages(data?.error) ?? (typeof data?.detail === 'string' ? data.detail : null);

    if (message) return message;

    if (error.response?.status === 403) return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    if (error.response?.status === 404) return 'Data yang diminta tidak ditemukan di server.';
    if (error.response?.status === 500) return 'Server mengalami kendala. Silakan coba lagi beberapa saat lagi.';
    if (!error.response) return 'Tidak dapat terhubung ke server. Periksa koneksi atau backend Anda.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

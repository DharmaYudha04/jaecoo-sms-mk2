function normalizeBaseUrl(raw: string) {
  try {
    const url = new URL(raw);
    // Local dev: avoid HTTPS to localhost if backend doesn't have TLS
    if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && url.protocol === 'https:') {
      url.protocol = 'http:';
      return url.toString().replace(/\/$/, '');
    }
    return raw;
  } catch {
    // If it's not a valid URL, fall back to the original string
    return raw;
  }
}

function getDefaultBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/api';
  }

  const { origin, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  return `${origin}/api`;
}

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? getDefaultBaseUrl();

export const apiConfig = {
  baseUrl: normalizeBaseUrl(rawBaseUrl),
  timeoutMs: 15_000,
};
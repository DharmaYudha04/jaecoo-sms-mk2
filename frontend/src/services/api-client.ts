import axios from 'axios';
import { apiConfig } from '@/config/api.config';
import { authStorage } from '@/services/auth-storage';

type RetryableRequestConfig = {
  _portFallbackTried?: boolean;
};

function buildLocalFallbackBaseUrls(baseUrl: string): string[] {
  if (!import.meta.env.DEV) {
    return [baseUrl];
  }

  try {
    const parsed = new URL(baseUrl);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (!isLocalHost) {
      return [baseUrl];
    }

    const protocol = parsed.protocol;
    const host = parsed.hostname;
    const path = parsed.pathname.replace(/\/$/, '');
    const currentPort = Number(parsed.port || '80');
    const preferredPorts = [3000, 3001, 3002, 3003, 3004, 3005];
    const orderedPorts = [currentPort, ...preferredPorts.filter((port) => port !== currentPort)];

    return orderedPorts.map((port) => `${protocol}//${host}:${port}${path}`);
  } catch {
    return [baseUrl];
  }
}

const fallbackBaseUrls = buildLocalFallbackBaseUrls(apiConfig.baseUrl);
let activeBaseUrl = fallbackBaseUrls[0] ?? apiConfig.baseUrl;

export const apiClient = axios.create({
  baseURL: activeBaseUrl,
  timeout: apiConfig.timeoutMs,
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const responseBaseUrl = response.config.baseURL;
    if (responseBaseUrl && responseBaseUrl !== activeBaseUrl) {
      activeBaseUrl = responseBaseUrl;
      apiClient.defaults.baseURL = activeBaseUrl;
    }
    return response;
  },
  async (error) => {
    const requestConfig = (error.config ?? {}) as typeof error.config & RetryableRequestConfig;

    if (!import.meta.env.DEV) {
      if (error.response?.status === 401) {
        authStorage.clear();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (!error.response && requestConfig && !requestConfig._portFallbackTried && fallbackBaseUrls.length > 1) {
      requestConfig._portFallbackTried = true;

      for (const candidateBaseUrl of fallbackBaseUrls) {
        if (candidateBaseUrl === (requestConfig.baseURL ?? activeBaseUrl)) {
          continue;
        }

        try {
          const retried = await apiClient.request({
            ...requestConfig,
            baseURL: candidateBaseUrl,
          });

          activeBaseUrl = candidateBaseUrl;
          apiClient.defaults.baseURL = candidateBaseUrl;
          return retried;
        } catch {
          // Try next local candidate port on network errors.
        }
      }
    }

    if (error.response?.status === 401) {
      authStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

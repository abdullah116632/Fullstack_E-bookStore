import axios from 'axios';
import { API_BASE_URL, API_FALLBACK_BASE_URLS } from '@/constants/api';

const API_BASE_URL_STORAGE_KEY = 'apiBaseUrl';

const getCandidateBaseUrls = () => {
  const preferred = typeof window !== 'undefined'
    ? localStorage.getItem(API_BASE_URL_STORAGE_KEY) || API_BASE_URL
    : API_BASE_URL;

  const all = [preferred, API_BASE_URL, ...API_FALLBACK_BASE_URLS];
  return [...new Set(all.filter(Boolean))];
};

const persistWorkingBaseUrl = (baseUrl) => {
  if (typeof window === 'undefined' || !baseUrl) return;
  localStorage.setItem(API_BASE_URL_STORAGE_KEY, baseUrl);
};

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add JWT Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storedBaseUrl = localStorage.getItem(API_BASE_URL_STORAGE_KEY);
      if (storedBaseUrl) {
        config.baseURL = storedBaseUrl;
      }

      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Errors
apiClient.interceptors.response.use(
  (response) => {
    if (response?.config?.baseURL) {
      persistWorkingBaseUrl(response.config.baseURL);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};

    // On connection issues, retry the same request against fallback API URLs.
    if (!error.response && !originalRequest.__triedFallbackBaseUrls) {
      originalRequest.__triedFallbackBaseUrls = true;
      const currentBaseUrl = originalRequest.baseURL || API_BASE_URL;
      const candidates = getCandidateBaseUrls().filter((url) => url !== currentBaseUrl);

      for (const baseUrl of candidates) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const retryResponse = await apiClient.request({
            ...originalRequest,
            baseURL: baseUrl,
            __triedFallbackBaseUrls: true,
          });
          persistWorkingBaseUrl(baseUrl);
          return retryResponse;
        } catch (retryError) {
          if (retryError.response) {
            return Promise.reject(retryError);
          }
        }
      }
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        // Dispatch logout action or redirect to login
        window.dispatchEvent(new Event('tokenExpired'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

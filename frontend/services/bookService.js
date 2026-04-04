import apiClient from './api';
import { AUTH_ENDPOINTS } from '@/constants/api';

export const bookService = {
  getPublicBooks: (limit = 100) => apiClient.get(`${AUTH_ENDPOINTS.BOOKS_PUBLIC}?limit=${limit}`),
  getFeaturedBooks: (limit = 6) => apiClient.get(`${AUTH_ENDPOINTS.BOOKS_FEATURED}?limit=${limit}`),
};

import apiClient from './api';
import { AUTH_ENDPOINTS } from '@/constants/api';

export const purchaseService = {
  createManualPurchase: (data) => apiClient.post(AUTH_ENDPOINTS.PURCHASES, data),
  getMyUnlockedBooks: () => apiClient.get(AUTH_ENDPOINTS.PURCHASES_MY_UNLOCKED),
  getMyPurchasedBooks: () => apiClient.get(AUTH_ENDPOINTS.PURCHASES_MY_BOOKS),
  downloadUnlockedBookPdf: (bookId) =>
    apiClient.get(`${AUTH_ENDPOINTS.PURCHASES}/books/${bookId}/read`, { responseType: 'blob' }),
  getAdminPurchases: (status = 'all') => apiClient.get(`${AUTH_ENDPOINTS.ADMIN_PURCHASES}?status=${status}`),
  approvePurchase: (purchaseId) => apiClient.patch(`${AUTH_ENDPOINTS.ADMIN_PURCHASES}/${purchaseId}/approve`),
};

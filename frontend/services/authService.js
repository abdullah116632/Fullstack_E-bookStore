import apiClient from './api';
import { AUTH_ENDPOINTS } from '@/constants/api';

// ==================== READER AUTH ====================

export const readerAuthService = {
  signup: (data) => apiClient.post(AUTH_ENDPOINTS.READER_SIGNUP, data),
  verifySignup: (data) => apiClient.post(AUTH_ENDPOINTS.READER_VERIFY_SIGNUP, data),
  login: (data) => apiClient.post(AUTH_ENDPOINTS.READER_LOGIN, data),
  forgotPassword: (data) => apiClient.post(AUTH_ENDPOINTS.READER_FORGOT_PASSWORD, data),
  verifyResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.READER_VERIFY_RESET_OTP, data),
  resetPassword: (data) => apiClient.post(AUTH_ENDPOINTS.READER_RESET_PASSWORD, data),
  updatePassword: (data) => apiClient.put(AUTH_ENDPOINTS.READER_UPDATE_PASSWORD, data),
  getProfile: () => apiClient.get(AUTH_ENDPOINTS.READER_PROFILE),
  updateProfile: (data) => apiClient.put(AUTH_ENDPOINTS.READER_PROFILE, data),
};

// ==================== PUBLISHER AUTH ====================

export const publisherAuthService = {
  signup: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_SIGNUP, data),
  verifySignup: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_VERIFY_SIGNUP, data),
  login: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_LOGIN, data),
  forgotPassword: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_FORGOT_PASSWORD, data),
  verifyResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_VERIFY_RESET_OTP, data),
  resetPassword: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_RESET_PASSWORD, data),
  updatePassword: (data) => apiClient.put(AUTH_ENDPOINTS.PUBLISHER_UPDATE_PASSWORD, data),
  getProfile: () => apiClient.get(AUTH_ENDPOINTS.PUBLISHER_PROFILE),
  updateProfile: (data) => apiClient.put(AUTH_ENDPOINTS.PUBLISHER_PROFILE, data),
};

// ==================== ADMIN AUTH ====================

export const adminAuthService = {
  login: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_LOGIN, data),
  forgotPassword: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_FORGOT_PASSWORD, data),
  verifyResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_VERIFY_RESET_OTP, data),
  resetPassword: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_RESET_PASSWORD, data),
  updatePassword: (data) => apiClient.put(AUTH_ENDPOINTS.ADMIN_UPDATE_PASSWORD, data),
  getProfile: () => apiClient.get(AUTH_ENDPOINTS.ADMIN_PROFILE),
};

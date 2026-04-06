import apiClient from './api';
import { AUTH_ENDPOINTS } from '@/constants/api';

// ==================== READER AUTH ====================

export const readerAuthService = {
  signup: (data) => apiClient.post(AUTH_ENDPOINTS.READER_SIGNUP, data),
  verifySignup: (data) => apiClient.post(AUTH_ENDPOINTS.READER_VERIFY_SIGNUP, data),
  login: (data) => apiClient.post(AUTH_ENDPOINTS.READER_LOGIN, data),
  forgotPassword: (data) => apiClient.post(AUTH_ENDPOINTS.READER_FORGOT_PASSWORD, data),
  resendResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.READER_RESEND_RESET_OTP, data),
  verifyResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.READER_VERIFY_RESET_OTP, data),
  resetPassword: (data) => apiClient.post(AUTH_ENDPOINTS.READER_RESET_PASSWORD, data),
  completeAccountSetup: (data) => apiClient.post(AUTH_ENDPOINTS.READER_COMPLETE_ACCOUNT_SETUP, data),
  updatePassword: (data) => apiClient.put(AUTH_ENDPOINTS.READER_UPDATE_PASSWORD, data),
  updateEmail: (data) => apiClient.post(AUTH_ENDPOINTS.READER_UPDATE_EMAIL, data),
  sendEmailChangeOTP: (data) => apiClient.post(AUTH_ENDPOINTS.READER_SEND_EMAIL_CHANGE_OTP, data),
  verifyEmailChangeOTP: (data) => apiClient.post(AUTH_ENDPOINTS.READER_VERIFY_EMAIL_CHANGE_OTP, data),
  getProfile: () => apiClient.get(AUTH_ENDPOINTS.READER_PROFILE),
  updateProfile: (data) => apiClient.put(AUTH_ENDPOINTS.READER_PROFILE, data),
};

// ==================== PUBLISHER AUTH ====================

export const publisherAuthService = {
  signup: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_SIGNUP, data),
  verifySignup: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_VERIFY_SIGNUP, data),
  login: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_LOGIN, data),
  forgotPassword: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_FORGOT_PASSWORD, data),
  resendResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_RESEND_RESET_OTP, data),
  verifyResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_VERIFY_RESET_OTP, data),
  resetPassword: (data) => apiClient.post(AUTH_ENDPOINTS.PUBLISHER_RESET_PASSWORD, data),
  updatePassword: (data) => apiClient.put(AUTH_ENDPOINTS.PUBLISHER_UPDATE_PASSWORD, data),
  getProfile: () => apiClient.get(AUTH_ENDPOINTS.PUBLISHER_PROFILE),
  updateProfile: (data) => apiClient.put(AUTH_ENDPOINTS.PUBLISHER_PROFILE, data),
  uploadBook: (formData) =>
    apiClient.post(AUTH_ENDPOINTS.PUBLISHER_UPLOAD_BOOK, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// ==================== ADMIN AUTH ====================

export const adminAuthService = {
  login: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_LOGIN, data),
  requestSignupOTP: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_REQUEST_SIGNUP_OTP, data),
  verifySignupOTP: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_VERIFY_SIGNUP_OTP, data),
  forgotPassword: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_FORGOT_PASSWORD, data),
  resendResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_RESEND_RESET_OTP, data),
  verifyResetOTP: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_VERIFY_RESET_OTP, data),
  resetPassword: (data) => apiClient.post(AUTH_ENDPOINTS.ADMIN_RESET_PASSWORD, data),
  updatePassword: (data) => apiClient.put(AUTH_ENDPOINTS.ADMIN_UPDATE_PASSWORD, data),
  getProfile: () => apiClient.get(AUTH_ENDPOINTS.ADMIN_PROFILE),
  getDashboard: () => apiClient.get(AUTH_ENDPOINTS.ADMIN_DASHBOARD),
  getAllBooks: () => apiClient.get(AUTH_ENDPOINTS.ADMIN_BOOKS),
  getAllReaders: () => apiClient.get(AUTH_ENDPOINTS.ADMIN_READERS),
  getAllPublishers: () => apiClient.get(AUTH_ENDPOINTS.ADMIN_PUBLISHERS),
  updateBookControls: (bookId, data) => apiClient.patch(`${AUTH_ENDPOINTS.ADMIN_BOOKS}/${bookId}`, data),
  deleteBook: (bookId) => apiClient.delete(`${AUTH_ENDPOINTS.ADMIN_BOOKS}/${bookId}`),
  getAllPurchases: (status = 'all') => apiClient.get(`${AUTH_ENDPOINTS.ADMIN_PURCHASES}?status=${status}`),
  approvePurchase: (purchaseId) => apiClient.patch(`${AUTH_ENDPOINTS.ADMIN_PURCHASES}/${purchaseId}/approve`),
  deactivatePurchase: (purchaseId, data) => apiClient.patch(`${AUTH_ENDPOINTS.ADMIN_PURCHASES}/${purchaseId}/deactivate`, data),
};

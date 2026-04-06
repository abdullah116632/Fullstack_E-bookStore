// API Base URL - Change based on environment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const API_FALLBACK_BASE_URLS = (process.env.NEXT_PUBLIC_API_FALLBACK_URLS || 'http://localhost:5001/api/v1,http://localhost:5002/api/v1')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  // Reader Auth
  READER_SIGNUP: '/auth/reader/signup',
  READER_VERIFY_SIGNUP: '/auth/reader/verify-signup',
  READER_LOGIN: '/auth/reader/login',
  READER_FORGOT_PASSWORD: '/auth/reader/forgot-password',
  READER_RESEND_RESET_OTP: '/auth/reader/resend-reset-otp',
  READER_VERIFY_RESET_OTP: '/auth/reader/verify-reset-otp',
  READER_RESET_PASSWORD: '/auth/reader/reset-password',
  READER_COMPLETE_ACCOUNT_SETUP: '/auth/reader/complete-account-setup',
  READER_UPDATE_PASSWORD: '/auth/reader/update-password',
  READER_UPDATE_EMAIL: '/auth/reader/update-email',
  READER_SEND_EMAIL_CHANGE_OTP: '/auth/reader/update-email/send-otp',
  READER_VERIFY_EMAIL_CHANGE_OTP: '/auth/reader/update-email/verify-otp',
  READER_PROFILE: '/auth/reader/profile',

  // Publisher Auth
  PUBLISHER_SIGNUP: '/auth/publisher/signup',
  PUBLISHER_VERIFY_SIGNUP: '/auth/publisher/verify-signup',
  PUBLISHER_LOGIN: '/auth/publisher/login',
  PUBLISHER_FORGOT_PASSWORD: '/auth/publisher/forgot-password',
  PUBLISHER_RESEND_RESET_OTP: '/auth/publisher/resend-reset-otp',
  PUBLISHER_VERIFY_RESET_OTP: '/auth/publisher/verify-reset-otp',
  PUBLISHER_RESET_PASSWORD: '/auth/publisher/reset-password',
  PUBLISHER_UPDATE_PASSWORD: '/auth/publisher/update-password',
  PUBLISHER_PROFILE: '/auth/publisher/profile',
  PUBLISHER_UPLOAD_BOOK: '/publisher/books/upload',

  // Admin Auth
  ADMIN_LOGIN: '/auth/admin/login',
  ADMIN_REQUEST_SIGNUP_OTP: '/auth/admin/request-signup-otp',
  ADMIN_VERIFY_SIGNUP_OTP: '/auth/admin/verify-signup-otp',
  ADMIN_FORGOT_PASSWORD: '/auth/admin/forgot-password',
  ADMIN_VERIFY_RESET_OTP: '/auth/admin/verify-reset-otp',
  ADMIN_RESET_PASSWORD: '/auth/admin/reset-password',
  ADMIN_UPDATE_PASSWORD: '/auth/admin/update-password',
  ADMIN_PROFILE: '/auth/admin/profile',
  ADMIN_DASHBOARD: '/auth/admin/dashboard',
  ADMIN_BOOKS: '/admin/books',
  ADMIN_READERS: '/admin/users/readers',
  ADMIN_PUBLISHERS: '/admin/users/publishers',

  // Public Books
  BOOKS_PUBLIC: '/books',
  BOOKS_ALL: '/books/all',
  BOOKS_FEATURED: '/books/featured',
  BOOKS_BY_ID: '/books',

  // Purchases
  PURCHASES: '/purchases',
  PURCHASES_MY_UNLOCKED: '/purchases/my-unlocked',
  PURCHASES_MY_BOOKS: '/purchases/my-books',
  ADMIN_PURCHASES: '/admin/purchases',

  // Health Check
  HEALTH: '/health',
};

// User Types
export const USER_TYPES = {
  READER: 'reader',
  PUBLISHER: 'publisher',
  ADMIN: 'admin',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please fill in all required fields correctly.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  INVALID_OTP: 'Invalid OTP. Please check and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGNUP_OTP_SENT: 'OTP sent to your email. Please verify.',
  OTP_VERIFIED: 'Email verified successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  PASSWORD_UPDATE_SUCCESS: 'Password updated successfully!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
};

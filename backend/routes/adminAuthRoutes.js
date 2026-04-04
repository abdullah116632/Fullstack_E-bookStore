import express from 'express';
import {
  adminLogin,
  adminForgotPassword,
  verifyAdminResetOTP,
  adminResetPassword,
  adminUpdatePassword,
  getAdminProfile,
} from '../controllers/adminAuthController.js';
import { protect } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/common.js';
import {
  loginValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
  updatePasswordValidation,
} from '../validators/validation.js';

const router = express.Router();

// ==================== ADMIN AUTHENTICATION ====================

// Login (Admins are pre-created by system admin)
router.post('/login', loginValidation, handleValidationErrors, adminLogin);

// Forgot Password - Send OTP
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, adminForgotPassword);

// Verify Reset OTP
router.post('/verify-reset-otp', verifyResetOTPValidation, handleValidationErrors, verifyAdminResetOTP);

// Reset Password
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, adminResetPassword);

// Update Password (Protected)
router.put('/update-password', protect, updatePasswordValidation, handleValidationErrors, adminUpdatePassword);

// Get Profile (Protected)
router.get('/profile', protect, getAdminProfile);

export default router;

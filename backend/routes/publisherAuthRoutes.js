import express from 'express';
import {
  publisherSignup,
  verifyPublisherSignup,
  publisherLogin,
  publisherForgotPassword,
  verifyPublisherResetOTP,
  publisherResetPassword,
  publisherUpdatePassword,
  publisherUpdateProfile,
  getPublisherProfile,
} from '../controllers/publisherAuthController.js';
import { protect } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/common.js';
import {
  publisherSignupValidation,
  verifySignupValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
  updatePasswordValidation,
  publisherUpdateProfileValidation,
} from '../validators/validation.js';

const router = express.Router();

// ==================== PUBLISHER AUTHENTICATION ====================

// Signup - Send OTP
router.post('/signup', publisherSignupValidation, handleValidationErrors, publisherSignup);

// Verify Signup OTP
router.post('/verify-signup', verifySignupValidation, handleValidationErrors, verifyPublisherSignup);

// Login
router.post('/login', loginValidation, handleValidationErrors, publisherLogin);

// Forgot Password - Send OTP
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, publisherForgotPassword);

// Verify Reset OTP
router.post('/verify-reset-otp', verifyResetOTPValidation, handleValidationErrors, verifyPublisherResetOTP);

// Reset Password
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, publisherResetPassword);

// Update Password (Protected)
router.put('/update-password', protect, updatePasswordValidation, handleValidationErrors, publisherUpdatePassword);

// Update Profile (Protected) - PUT /profile
router.put('/profile', protect, publisherUpdateProfileValidation, handleValidationErrors, publisherUpdateProfile);

// Get Profile (Protected)
router.get('/profile', protect, getPublisherProfile);

export default router;

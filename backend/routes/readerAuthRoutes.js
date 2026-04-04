import express from 'express';
import {
  readerSignup,
  verifyReaderSignup,
  readerLogin,
  readerForgotPassword,
  verifyReaderResetOTP,
  readerResetPassword,
  readerUpdatePassword,
  readerUpdateProfile,
  getReaderProfile,
} from '../controllers/readerAuthController.js';
import { protect } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/common.js';
import {
  signupValidation,
  verifySignupValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyResetOTPValidation,
  resetPasswordValidation,
  updatePasswordValidation,
  updateProfileValidation,
} from '../validators/validation.js';

const router = express.Router();

// ==================== READER AUTHENTICATION ====================

// Signup - Send OTP
router.post('/signup', signupValidation, handleValidationErrors, readerSignup);

// Verify Signup OTP
router.post('/verify-signup', verifySignupValidation, handleValidationErrors, verifyReaderSignup);

// Login
router.post('/login', loginValidation, handleValidationErrors, readerLogin);

// Forgot Password - Send OTP
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, readerForgotPassword);

// Verify Reset OTP
router.post('/verify-reset-otp', verifyResetOTPValidation, handleValidationErrors, verifyReaderResetOTP);

// Reset Password
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, readerResetPassword);

// Update Password (Protected)
router.put('/update-password', protect, updatePasswordValidation, handleValidationErrors, readerUpdatePassword);

// Update Profile (Protected) - PUT /profile
router.put('/profile', protect, updateProfileValidation, handleValidationErrors, readerUpdateProfile);

// Get Profile (Protected)
router.get('/profile', protect, getReaderProfile);

export default router;

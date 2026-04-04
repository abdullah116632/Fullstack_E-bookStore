import Admin from '../models/Admin.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendOTPEmail } from '../utils/emailService.js';
import { generateOTP, getOTPExpiryTime, isOTPValid, isOTPAttemptsExceeded } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

// ==================== ADMIN ENDPOINTS ====================

// Admin Login (no signup - pre-created accounts only)
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin and select password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if active
    if (!admin.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Your admin account is deactivated.',
      });
    }

    // Verify password
    const isPasswordCorrect = await admin.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Admin login successful.',
      data: {
        token,
        user: admin.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Forgot Password - Send OTP
export const adminForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      // For security, don't reveal if email exists
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If email exists, OTP will be sent. Please check your inbox.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    // Save reset OTP
    admin.resetOTP = {
      code: otp,
      expiresAt: otpExpiry,
      attempts: 0,
    };
    await admin.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, 'reset');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
    });
  } catch (error) {
    next(error);
  }
};

// Admin Verify Reset OTP
export const verifyAdminResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    // Check OTP validity
    if (!admin.resetOTP?.code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP not found. Please request password reset again.',
      });
    }

    if (!isOTPValid(admin.resetOTP.expiresAt)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP expired. Please request password reset again.',
      });
    }

    if (isOTPAttemptsExceeded(admin.resetOTP.attempts)) {
      admin.resetOTP = undefined;
      await admin.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many OTP attempts. Please try again later.',
      });
    }

    // Verify OTP
    if (admin.resetOTP.code !== otp) {
      admin.resetOTP.attempts += 1;
      await admin.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid OTP. ${5 - admin.resetOTP.attempts} attempts remaining.`,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'OTP verified. You can now reset your password.',
      data: {
        verified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Reset Password
export const adminResetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    // Update password
    admin.password = newPassword;
    admin.resetOTP = undefined;
    await admin.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// Admin Update Password (requires authentication)
export const adminUpdatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user._id;

    // Find admin with password
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    // Verify current password
    const isPasswordCorrect = await admin.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get Admin Profile (requires authentication)
export const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user._id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: admin.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

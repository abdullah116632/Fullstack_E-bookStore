import Admin from '../models/Admin.js';
import AdminSignupRequest from '../models/AdminSignupRequest.js';
import Book from '../models/Book.js';
import Purchase from '../models/Purchase.js';
import Reader from '../models/Reader.js';
import Publisher from '../models/Publisher.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendOTPEmail } from '../utils/emailService.js';
import { generateOTP, getOTPExpiryTime, isOTPValid, isOTPAttemptsExceeded } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';
import { runAutoActivation } from '../utils/purchaseActivation.js';

const MAIN_ADMIN_APPROVAL_EMAIL = (process.env.ADMIN_SIGNUP_EMAIL || 'abdullah116632@gmail.com').toLowerCase();

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

// Request OTP for Admin Account Creation
export const requestAdminSignupOTP = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Admin account already exists for this email.',
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    await AdminSignupRequest.findOneAndUpdate(
      { email: normalizedEmail },
      {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        phoneNumber: phoneNumber || null,
        otp: {
          code: otp,
          expiresAt: otpExpiry,
          attempts: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      await sendOTPEmail(MAIN_ADMIN_APPROVAL_EMAIL, otp, 'signup');
    } catch (emailError) {
      console.error('Failed to send admin signup OTP:', emailError);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `OTP sent to main admin email ${MAIN_ADMIN_APPROVAL_EMAIL}.`,
      data: {
        requestedAdminEmail: normalizedEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP and Create Admin Account
export const verifyAdminSignupOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const pendingRequest = await AdminSignupRequest.findOne({ email: normalizedEmail });
    if (!pendingRequest || !pendingRequest.otp?.code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No pending admin signup request found. Please request OTP first.',
      });
    }

    if (!isOTPValid(pendingRequest.otp.expiresAt)) {
      await AdminSignupRequest.deleteOne({ _id: pendingRequest._id });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    if (isOTPAttemptsExceeded(pendingRequest.otp.attempts)) {
      await AdminSignupRequest.deleteOne({ _id: pendingRequest._id });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many OTP attempts. Please request a new OTP.',
      });
    }

    if (pendingRequest.otp.code !== otp) {
      pendingRequest.otp.attempts += 1;
      await pendingRequest.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid OTP. ${5 - pendingRequest.otp.attempts} attempts remaining.`,
      });
    }

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      await AdminSignupRequest.deleteOne({ _id: pendingRequest._id });
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Admin account already exists for this email.',
      });
    }

    const admin = await Admin.create({
      fullName: pendingRequest.fullName,
      email: pendingRequest.email,
      password: pendingRequest.password,
      phoneNumber: pendingRequest.phoneNumber,
      isEmailVerified: true,
      isActive: true,
    });

    await AdminSignupRequest.deleteOne({ _id: pendingRequest._id });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Admin account created successfully. Please login.',
      data: {
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

// Get Admin Dashboard Data (requires admin authentication)
export const getAdminDashboard = async (req, res, next) => {
  try {
    if (!req.user || req.user.constructor?.modelName !== 'Admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Only admins can access dashboard data.',
      });
    }

    await runAutoActivation();

    const [
      totalBooks,
      totalOrders,
      totalReaders,
      totalPublishers,
      recentBooks,
      recentReaders,
      recentPublishers,
      revenueAggregation,
    ] = await Promise.all([
      Book.countDocuments(),
      Purchase.countDocuments(),
      Reader.countDocuments(),
      Publisher.countDocuments(),
      Book.find({})
        .populate('publisher', 'publisherName fullName email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Reader.find({})
        .select('fullName email isActive isEmailVerified createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Publisher.find({})
        .select('publisherName fullName email isActive isApproved isEmailVerified createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Purchase.aggregate([
        {
          $match: {
            status: 'completed',
            paymentStatus: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueAggregation?.[0]?.totalRevenue || 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        stats: {
          totalBooks,
          totalSales: totalOrders,
          totalUsers: totalReaders,
          totalPublishers,
          totalRevenue,
        },
        books: recentBooks,
        users: recentReaders,
        publishers: recentPublishers,
      },
    });
  } catch (error) {
    next(error);
  }
};

import Reader from '../models/Reader.js';
import { generateToken, verifyAccountSetupToken } from '../utils/tokenUtils.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/emailService.js';
import { generateOTP, getOTPExpiryTime, isOTPValid, isOTPAttemptsExceeded } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

// ==================== READER ENDPOINTS ====================

// Reader Signup - Send OTP
export const readerSignup = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if reader already exists
    const existingReader = await Reader.findOne({ email });
    if (existingReader) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Email already registered. Please login or use a different email.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    // Create reader with pending verification
    const reader = new Reader({
      fullName,
      email,
      password,
      signupOTP: {
        code: otp,
        expiresAt: otpExpiry,
        attempts: 0,
      },
      isEmailVerified: false,
    });

    await reader.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, 'signup');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Delete reader if email fails
      await Reader.deleteOne({ _id: reader._id });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.',
      data: {
        email: reader.email,
        message: 'Check your email for the 6-digit OTP',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reader Verify Signup OTP
export const verifyReaderSignup = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find reader with pending verification
    const reader = await Reader.findOne({ email, isEmailVerified: false });
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found or already verified.',
      });
    }

    // Check OTP validity
    if (!reader.signupOTP?.code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP not found. Please signup again.',
      });
    }

    if (!isOTPValid(reader.signupOTP.expiresAt)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP expired. Please signup again.',
      });
    }

    if (isOTPAttemptsExceeded(reader.signupOTP.attempts)) {
      await Reader.deleteOne({ _id: reader._id });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many OTP attempts. Please signup again.',
      });
    }

    // Verify OTP
    if (reader.signupOTP.code !== otp) {
      reader.signupOTP.attempts += 1;
      await reader.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid OTP. ${5 - reader.signupOTP.attempts} attempts remaining.`,
      });
    }

    // Mark email as verified
    reader.isEmailVerified = true;
    reader.signupOTP = undefined;
    await reader.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(reader.email, reader.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Generate token
    const token = generateToken(reader._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully. Welcome!',
      data: {
        token,
        user: reader.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reader Login
export const readerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find reader and select password
    const reader = await Reader.findOne({ email }).select('+password');
    if (!reader) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if verified
    if (!reader.isEmailVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP.',
      });
    }

    // Check if active
    if (!reader.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    // Verify password
    const isPasswordCorrect = await reader.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login
    reader.lastLogin = new Date();
    await reader.save();

    // Generate token
    const token = generateToken(reader._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: reader.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const sendReaderResetOTP = async (email) => {
  const reader = await Reader.findOne({ email });
  if (!reader) {
    return {
      status: HTTP_STATUS.NOT_FOUND,
      body: {
        success: false,
        message: 'Email does not exist for reader account.',
      },
    };
  }

  const otp = generateOTP();
  const otpExpiry = getOTPExpiryTime();

  reader.resetOTP = {
    code: otp,
    expiresAt: otpExpiry,
    attempts: 0,
  };
  await reader.save();

  try {
    await sendOTPEmail(email, otp, 'reset');
  } catch (emailError) {
    console.error('Failed to send OTP email:', emailError);
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      },
    };
  }

  return {
    status: HTTP_STATUS.OK,
    body: {
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
    },
  };
};

// Forgot Password - Send OTP
export const readerForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await sendReaderResetOTP(email);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Resend OTP
export const resendReaderResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await sendReaderResetOTP(email);
    if (result.body.success) {
      result.body.message = 'OTP resent to your email. Please check your inbox.';
    }
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Verify Reset OTP
export const verifyReaderResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find reader
    const reader = await Reader.findOne({ email });
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    // Check OTP validity
    if (!reader.resetOTP?.code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP not found. Please request password reset again.',
      });
    }

    if (!isOTPValid(reader.resetOTP.expiresAt)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP expired. Please request password reset again.',
      });
    }

    if (isOTPAttemptsExceeded(reader.resetOTP.attempts)) {
      reader.resetOTP = undefined;
      await reader.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many OTP attempts. Please try again later.',
      });
    }

    // Verify OTP
    if (reader.resetOTP.code !== otp) {
      reader.resetOTP.attempts += 1;
      await reader.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid OTP. ${5 - reader.resetOTP.attempts} attempts remaining.`,
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

// Reset Password
export const readerResetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    // Find reader
    const reader = await Reader.findOne({ email });
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    // Update password
    reader.password = newPassword;
    reader.resetOTP = undefined;
    await reader.save();

    if (!reader.isEmailVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP.',
      });
    }

    if (!reader.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    const token = generateToken(reader._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset successfully. You are now logged in.',
      data: {
        token,
        user: reader.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Complete auto-created account setup (via email link) and login
export const readerCompleteAutoAccountSetup = async (req, res, next) => {
  try {
    const { token, temporaryPassword, newPassword } = req.body;

    const decoded = verifyAccountSetupToken(token);
    if (!decoded?.id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid or expired setup link. Please request a new one.',
      });
    }

    const reader = await Reader.findById(decoded.id).select('+password');
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    if (!reader.isActive) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    const isTempPasswordValid = await reader.matchPassword(String(temporaryPassword || ''));
    if (!isTempPasswordValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Temporary password is incorrect.',
      });
    }

    reader.password = newPassword;
    reader.lastLogin = new Date();
    await reader.save();

    const tokenForLogin = generateToken(reader._id);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password updated successfully. You are now logged in.',
      data: {
        token: tokenForLogin,
        user: reader.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update Password (requires authentication)
export const readerUpdatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const readerId = req.user._id;

    // Find reader with password
    const reader = await Reader.findById(readerId).select('+password');
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    // Verify current password
    const isPasswordCorrect = await reader.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password
    reader.password = newPassword;
    await reader.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile (requires authentication)
export const readerUpdateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const readerId = req.user._id;

    // Find and update reader
    const reader = await Reader.findByIdAndUpdate(
      readerId,
      { fullName },
      { new: true, runValidators: true }
    );

    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: reader.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Send Email Change OTP (requires authentication)
export const readerSendEmailChangeOTP = async (req, res, next) => {
  try {
    const { newEmail, currentPassword } = req.body;
    const readerId = req.user._id;

    const reader = await Reader.findById(readerId).select('+password');
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    const isPasswordCorrect = await reader.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    if (reader.email === normalizedEmail) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'New email must be different from current email.',
      });
    }

    const existingReader = await Reader.findOne({ email: normalizedEmail, _id: { $ne: readerId } });
    if (existingReader) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Email already in use. Please choose another email.',
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    reader.emailChangeOTP = {
      newEmail: normalizedEmail,
      code: otp,
      expiresAt: otpExpiry,
      attempts: 0,
    };

    await reader.save();

    try {
      await sendOTPEmail(normalizedEmail, otp, 'email-change');
    } catch (emailError) {
      console.error('Failed to send email change OTP:', emailError);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'OTP sent to your new email address. Please verify to continue.',
      data: {
        newEmail: normalizedEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify Email Change OTP and update email (requires authentication)
export const readerVerifyEmailChangeOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const readerId = req.user._id;

    const reader = await Reader.findById(readerId);
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    if (!reader.emailChangeOTP?.code || !reader.emailChangeOTP?.newEmail) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No email change request found. Please request OTP first.',
      });
    }

    if (!isOTPValid(reader.emailChangeOTP.expiresAt)) {
      reader.emailChangeOTP = undefined;
      await reader.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    if (isOTPAttemptsExceeded(reader.emailChangeOTP.attempts)) {
      reader.emailChangeOTP = undefined;
      await reader.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many OTP attempts. Please request a new OTP.',
      });
    }

    if (reader.emailChangeOTP.code !== otp) {
      reader.emailChangeOTP.attempts += 1;
      await reader.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid OTP. ${5 - reader.emailChangeOTP.attempts} attempts remaining.`,
      });
    }

    const requestedEmail = reader.emailChangeOTP.newEmail;

    const existingReader = await Reader.findOne({ email: requestedEmail, _id: { $ne: readerId } });
    if (existingReader) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'This email is no longer available. Please try a different one.',
      });
    }

    reader.email = requestedEmail;
    reader.emailChangeOTP = undefined;
    await reader.save();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email updated successfully.',
      data: {
        user: reader.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Reader Profile (requires authentication)
export const getReaderProfile = async (req, res, next) => {
  try {
    const readerId = req.user._id;

    const reader = await Reader.findById(readerId);
    if (!reader) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Reader not found.',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: reader.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

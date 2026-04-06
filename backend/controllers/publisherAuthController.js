import Publisher from '../models/Publisher.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/emailService.js';
import { generateOTP, getOTPExpiryTime, isOTPValid, isOTPAttemptsExceeded } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

// ==================== PUBLISHER ENDPOINTS ====================

// Publisher Signup - Send OTP
export const publisherSignup = async (req, res, next) => {
  try {
    const { fullName, email, password, publisherName, phoneNumber, address } = req.body;

    // Check if publisher already exists
    const existingPublisher = await Publisher.findOne({ email });
    if (existingPublisher) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Email already registered. Please login or use a different email.',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();

    // Create publisher with pending verification
    const publisher = new Publisher({
      fullName,
      email,
      password,
      publisherName,
      phoneNumber,
      address,
      signupOTP: {
        code: otp,
        expiresAt: otpExpiry,
        attempts: 0,
      },
      isEmailVerified: false,
      isApproved: false, // Requires admin approval
    });

    await publisher.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, 'signup');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Delete publisher if email fails
      await Publisher.deleteOne({ _id: publisher._id });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.',
      data: {
        email: publisher.email,
        message: 'Check your email for the 6-digit OTP. Admin approval required after verification.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Publisher Verify Signup OTP
export const verifyPublisherSignup = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find publisher with pending verification
    const publisher = await Publisher.findOne({ email, isEmailVerified: false });
    if (!publisher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Publisher not found or already verified.',
      });
    }

    // Check OTP validity
    if (!publisher.signupOTP?.code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP not found. Please signup again.',
      });
    }

    if (!isOTPValid(publisher.signupOTP.expiresAt)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP expired. Please signup again.',
      });
    }

    if (isOTPAttemptsExceeded(publisher.signupOTP.attempts)) {
      await Publisher.deleteOne({ _id: publisher._id });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many OTP attempts. Please signup again.',
      });
    }

    // Verify OTP
    if (publisher.signupOTP.code !== otp) {
      publisher.signupOTP.attempts += 1;
      await publisher.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid OTP. ${5 - publisher.signupOTP.attempts} attempts remaining.`,
      });
    }

    // Mark email as verified
    publisher.isEmailVerified = true;
    publisher.signupOTP = undefined;
    await publisher.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(publisher.email, publisher.fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    const token = generateToken(publisher._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully. Welcome to your publisher dashboard.',
      data: {
        token,
        user: publisher.toJSON(),
        email: publisher.email,
        isApproved: publisher.isApproved,
        message: 'Admin will review your publisher account and approve it shortly.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Publisher Login
export const publisherLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find publisher and select password
    const publisher = await Publisher.findOne({ email }).select('+password');
    if (!publisher) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if verified
    if (!publisher.isEmailVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP.',
      });
    }

    // Check if approved by admin
    if (!publisher.isApproved) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Your publisher account is awaiting admin approval.',
      });
    }

    // Check if active
    if (!publisher.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    // Verify password
    const isPasswordCorrect = await publisher.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login
    publisher.lastLogin = new Date();
    await publisher.save();

    // Generate token
    const token = generateToken(publisher._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: publisher.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const sendPublisherResetOTP = async (email) => {
  const publisher = await Publisher.findOne({ email });
  if (!publisher) {
    return {
      status: HTTP_STATUS.NOT_FOUND,
      body: {
        success: false,
        message: 'Email does not exist for publisher account.',
      },
    };
  }

  const otp = generateOTP();
  const otpExpiry = getOTPExpiryTime();

  publisher.resetOTP = {
    code: otp,
    expiresAt: otpExpiry,
    attempts: 0,
  };
  await publisher.save();

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
export const publisherForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await sendPublisherResetOTP(email);
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Resend OTP
export const resendPublisherResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await sendPublisherResetOTP(email);
    if (result.body.success) {
      result.body.message = 'OTP resent to your email. Please check your inbox.';
    }
    res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

// Verify Reset OTP
export const verifyPublisherResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find publisher
    const publisher = await Publisher.findOne({ email });
    if (!publisher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Publisher not found.',
      });
    }

    // Check OTP validity
    if (!publisher.resetOTP?.code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP not found. Please request password reset again.',
      });
    }

    if (!isOTPValid(publisher.resetOTP.expiresAt)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'OTP expired. Please request password reset again.',
      });
    }

    if (isOTPAttemptsExceeded(publisher.resetOTP.attempts)) {
      publisher.resetOTP = undefined;
      await publisher.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many OTP attempts. Please try again later.',
      });
    }

    // Verify OTP
    if (publisher.resetOTP.code !== otp) {
      publisher.resetOTP.attempts += 1;
      await publisher.save();
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid OTP. ${5 - publisher.resetOTP.attempts} attempts remaining.`,
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
export const publisherResetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    // Find publisher
    const publisher = await Publisher.findOne({ email });
    if (!publisher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Publisher not found.',
      });
    }

    // Update password
    publisher.password = newPassword;
    publisher.resetOTP = undefined;
    await publisher.save();

    if (!publisher.isEmailVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP.',
      });
    }

    if (!publisher.isApproved) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Your publisher account is awaiting admin approval.',
      });
    }

    if (!publisher.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    const token = generateToken(publisher._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset successfully. You are now logged in.',
      data: {
        token,
        user: publisher.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update Password (requires authentication)
export const publisherUpdatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const publisherId = req.user._id;

    // Find publisher with password
    const publisher = await Publisher.findById(publisherId).select('+password');
    if (!publisher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Publisher not found.',
      });
    }

    // Verify current password
    const isPasswordCorrect = await publisher.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password
    publisher.password = newPassword;
    await publisher.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile (requires authentication)
export const publisherUpdateProfile = async (req, res, next) => {
  try {
    const { fullName, publisherName, phoneNumber, address } = req.body;
    const publisherId = req.user._id;

    // Build update object (only update provided fields)
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (publisherName) updateData.publisherName = publisherName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (address) updateData.address = address;

    // Find and update publisher
    const publisher = await Publisher.findByIdAndUpdate(
      publisherId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!publisher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Publisher not found.',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: publisher.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Publisher Profile (requires authentication)
export const getPublisherProfile = async (req, res, next) => {
  try {
    const publisherId = req.user._id;

    const publisher = await Publisher.findById(publisherId);
    if (!publisher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Publisher not found.',
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: publisher.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

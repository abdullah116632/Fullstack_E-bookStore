import { Resend } from 'resend';

// Lazy load Resend instance to ensure dotenv is loaded first
let resend = null;

const getResend = () => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set in environment variables. Check your .env file.');
    }
    resend = new Resend(apiKey);
  }
  return resend;
};

export const sendOTPEmail = async (email, otp, userType = 'signup') => {
  try {
    let subject = 'Password Reset OTP - E-book Marketplace';
    let htmlContent = `
      <h2>Password Reset Request</h2>
      <p>Your OTP for resetting your password is:</p>
      <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    if (userType === 'signup') {
      subject = 'Verify Your Email - E-book Marketplace';
      htmlContent = `
        <h2>Email Verification</h2>
        <p>Your OTP for verifying your email is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
    }

    if (userType === 'email-change') {
      subject = 'Verify New Email - E-book Marketplace';
      htmlContent = `
        <h2>Email Change Verification</h2>
        <p>Your OTP for changing your account email is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please secure your account immediately.</p>
      `;
    }

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject,
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, fullName) => {
  try {
    const htmlContent = `
      <h2>Welcome to E-book Marketplace, ${fullName}!</h2>
      <p>We're excited to have you join our community.</p>
      <p>Explore thousands of books and start your reading journey today.</p>
    `;

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to E-book Marketplace',
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async (email, fullName, orderNumber, totalAmount) => {
  try {
    const htmlContent = `
      <h2>Order Confirmation</h2>
      <p>Dear ${fullName},</p>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Total Amount:</strong> $${totalAmount}</p>
      <p>Your order has been received and is being processed.</p>
      <p>You can download your books from your library once the payment is confirmed.</p>
    `;

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendGuestPurchaseAccountEmail = async (email, fullName, generatedPassword, setupPasswordLink) => {
  try {
    const setupLinkSection = setupPasswordLink
      ? `
      <p style="margin-top: 20px;">
        <a href="${setupPasswordLink}" style="display:inline-block;padding:10px 16px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Set Your Password
        </a>
      </p>
      <p>You can also copy this link and open it in your browser:</p>
      <p style="word-break:break-all;">${setupPasswordLink}</p>
      `
      : '';

    const htmlContent = `
      <h2>Reader Account Created for Your Purchase</h2>
      <p>Hello ${fullName},</p>
      <p>We created a reader account for your email so you can access books you purchase.</p>
      <p><strong>Login Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
      <p>Please set a new password using the link below and keep your account secure.</p>
      ${setupLinkSection}
    `;

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Your Reader Account Credentials - E-book Marketplace',
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendManualPurchaseSubmittedEmail = async (email, fullName, orderNumber, bookTitle) => {
  try {
    const htmlContent = `
      <h2>Purchase Submitted Successfully</h2>
      <p>Dear ${fullName},</p>
      <p>Your payment information has been submitted successfully.</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Book:</strong> ${bookTitle}</p>
      <p>Your book will be unlocked shortly. It may take up to 1 hour.</p>
    `;

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Purchase Submitted - ${orderNumber}`,
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

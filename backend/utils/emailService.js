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
    const subject = userType === 'signup' ? 'Verify Your Email - E-book Marketplace' : 'Password Reset OTP - E-book Marketplace';
    
    const htmlContent = userType === 'signup' ? `
      <h2>Email Verification</h2>
      <p>Your OTP for verifying your email is:</p>
      <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    ` : `
      <h2>Password Reset Request</h2>
      <p>Your OTP for resetting your password is:</p>
      <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@ebookmarketplace.com',
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
      from: process.env.RESEND_FROM_EMAIL || 'noreply@ebookmarketplace.com',
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
      from: process.env.RESEND_FROM_EMAIL || 'noreply@ebookmarketplace.com',
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

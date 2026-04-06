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

const BRAND_NAME = 'Okkhorbari E-Book Marketplace';

const getSupportEmail = () => {
  return process.env.SUPPORT_EMAIL || process.env.RESEND_FROM_EMAIL || 'abdullah116632@gmail.com';
};

const getRecipientName = (name) => {
  if (typeof name === 'string' && name.trim()) return name.trim();
  return 'Customer';
};

const buildEmailHtml = ({ heading, greeting, bodyHtml, noteHtml = '' }) => `
  <div style="font-family: Arial, Helvetica, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">
    <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f766e, #0891b2); color: #ffffff; padding: 18px 22px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">${heading}</h2>
      </div>
      <div style="padding: 22px; line-height: 1.6; font-size: 14px; color: #1e293b;">
        <p style="margin-top: 0;">${greeting}</p>
        ${bodyHtml}
        ${noteHtml}
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 22px 0;" />
        <p style="margin: 0; color: #475569; font-size: 13px;">Regards,<br />${BRAND_NAME} Team</p>
        <p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">Need help? Contact us at <a href="mailto:${getSupportEmail()}" style="color:#0284c7; text-decoration:none;">${getSupportEmail()}</a></p>
      </div>
    </div>
  </div>
`;

const buildOtpBlock = (otp) => `
  <div style="margin: 16px 0; text-align: center;">
    <p style="margin: 0 0 10px; color: #334155; font-size: 13px;">Your One-Time Password (OTP)</p>
    <div style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 18px;">
      <span style="font-size: 30px; letter-spacing: 6px; font-weight: 700; color: #1d4ed8;">${otp}</span>
    </div>
  </div>
`;

export const sendOTPEmail = async (email, otp, userType = 'signup') => {
  try {
    let subject = 'Password Reset Verification Code - Okkhorbari';
    let heading = 'Password Reset Verification';
    let bodyHtml = `
      <p>We received a request to reset your password for your ${BRAND_NAME} account.</p>
      ${buildOtpBlock(otp)}
      <p>This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
      <p>If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>
    `;

    if (userType === 'signup') {
      subject = 'Email Verification Code - Okkhorbari';
      heading = 'Verify Your Email Address';
      bodyHtml = `
        <p>Thank you for registering with ${BRAND_NAME}. Please use the code below to verify your email address.</p>
        ${buildOtpBlock(otp)}
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not initiate this registration, please ignore this message.</p>
      `;
    }

    if (userType === 'email-change') {
      subject = 'New Email Verification Code - Okkhorbari';
      heading = 'Confirm Your New Email Address';
      bodyHtml = `
        <p>We received a request to update the email address associated with your account.</p>
        ${buildOtpBlock(otp)}
        <p>This OTP is valid for 10 minutes and required to complete the email update.</p>
        <p>If you did not request this change, we recommend updating your password immediately and contacting support.</p>
      `;
    }

    const htmlContent = buildEmailHtml({
      heading,
      greeting: 'Hello,',
      bodyHtml,
    });

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
    const customerName = getRecipientName(fullName);
    const htmlContent = buildEmailHtml({
      heading: 'Welcome to Okkhorbari',
      greeting: `Hello ${customerName},`,
      bodyHtml: `
        <p>Your account has been successfully created.</p>
        <p>You can now browse books, complete purchases, and read your purchased titles from your library.</p>
        <p>We are glad to have you with us and look forward to supporting your reading journey.</p>
      `,
    });

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to Okkhorbari E-Book Marketplace',
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
    const customerName = getRecipientName(fullName);
    const htmlContent = buildEmailHtml({
      heading: 'Order Confirmation',
      greeting: `Dear ${customerName},`,
      bodyHtml: `
        <p>Thank you for your purchase. Your order has been received successfully.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ${totalAmount}</p>
        <p>Your order is currently being processed. Once payment verification is completed, your purchased book(s) will be available in your library.</p>
      `,
    });

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Order Confirmation - ${orderNumber} | Okkhorbari`,
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
    const customerName = getRecipientName(fullName);
    const setupLinkSection = setupPasswordLink
      ? `
      <p style="margin: 16px 0 10px;">
        <a href="${setupPasswordLink}" style="display:inline-block;padding:10px 16px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Set Your Password
        </a>
      </p>
      <p style="margin: 0 0 6px;">You can also copy and open this link in your browser:</p>
      <p style="word-break:break-all; margin: 0;"><a href="${setupPasswordLink}" style="color:#0284c7; text-decoration:none;">${setupPasswordLink}</a></p>
      `
      : '<p>Please sign in and change your password immediately to keep your account secure.</p>';

    const htmlContent = buildEmailHtml({
      heading: 'Your Reader Account Has Been Created',
      greeting: `Hello ${customerName},`,
      bodyHtml: `
        <p>To help you access your purchase quickly, we created a reader account for this email address.</p>
        <p><strong>Login Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
        <p>For security, please set a new password as soon as possible.</p>
        ${setupLinkSection}
      `,
      noteHtml: '<p style="margin-top: 14px; color:#475569; font-size:13px;">Security reminder: Never share your password with anyone.</p>',
    });

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Your Reader Account Details - Okkhorbari',
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
    const customerName = getRecipientName(fullName);
    const htmlContent = buildEmailHtml({
      heading: 'Purchase Submission Received',
      greeting: `Dear ${customerName},`,
      bodyHtml: `
        <p>We have received your payment submission and it is now pending review.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Book:</strong> ${bookTitle}</p>
        <p>After verification, access to the book will be activated. This process may take up to 1 hour.</p>
      `,
    });

    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Purchase Submitted - ${orderNumber} | Okkhorbari`,
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

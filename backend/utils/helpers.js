// Generate random OTP (6 digits)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get OTP expiry time (10 minutes from now)
export const getOTPExpiryTime = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Check if OTP is still valid
export const isOTPValid = (expiresAt) => {
  return new Date() < new Date(expiresAt);
};

// Check if OTP attempts exceeded (max 5 attempts)
export const isOTPAttemptsExceeded = (attempts) => {
  return attempts >= 5;
};

export const generateRandomToken = () => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

export const formatResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    message,
    data,
    statusCode,
  };
};

export const calculateDiscount = (price, discountPercentage) => {
  return price * (discountPercentage / 100);
};

export const calculateFinalPrice = (price, discountPercentage = 0, taxPercentage = 0) => {
  const discountAmount = calculateDiscount(price, discountPercentage);
  const priceAfterDiscount = price - discountAmount;
  const taxAmount = priceAfterDiscount * (taxPercentage / 100);
  return {
    originalPrice: price,
    discountAmount,
    taxAmount,
    finalPrice: priceAfterDiscount + taxAmount,
  };
};

export const isEmailValid = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
};

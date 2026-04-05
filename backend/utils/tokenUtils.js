import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateAccountSetupToken = ({ readerId, email }) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.ACCOUNT_SETUP_TOKEN_EXPIRE || '24h';

  return jwt.sign(
    {
      id: readerId,
      email,
      purpose: 'auto-account-password-setup',
    },
    secret,
    { expiresIn }
  );
};

export const verifyAccountSetupToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.purpose !== 'auto-account-password-setup') return null;
    return decoded;
  } catch (error) {
    return null;
  }
};

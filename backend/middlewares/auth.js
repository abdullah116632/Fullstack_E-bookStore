import jwt from 'jsonwebtoken';
import Reader from '../models/Reader.js';
import Publisher from '../models/Publisher.js';
import Admin from '../models/Admin.js';
import { HTTP_STATUS } from '../config/constants.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in Reader, Publisher, or Admin
    let user = await Reader.findById(decoded.id);
    if (!user) {
      user = await Publisher.findById(decoded.id);
    }
    if (!user) {
      user = await Admin.findById(decoded.id);
    }

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await Reader.findById(decoded.id);
    if (!user) {
      user = await Publisher.findById(decoded.id);
    }
    if (!user) {
      user = await Admin.findById(decoded.id);
    }

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

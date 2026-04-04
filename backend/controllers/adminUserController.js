import Reader from '../models/Reader.js';
import Publisher from '../models/Publisher.js';
import { HTTP_STATUS } from '../config/constants.js';

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.constructor?.modelName !== 'Admin') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Only admins can access user management.',
    });
    return false;
  }
  return true;
};

export const getAllReadersForAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const readers = await Reader.find({})
      .select('fullName email isActive isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        readers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPublishersForAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const publishers = await Publisher.find({})
      .select('publisherName fullName email isActive isApproved isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        publishers,
      },
    });
  } catch (error) {
    next(error);
  }
};

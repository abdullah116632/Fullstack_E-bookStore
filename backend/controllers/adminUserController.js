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

    const searchEmail = String(req.query.searchEmail || '').trim().toLowerCase();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 50, 100));
    const skip = (page - 1) * limit;
    const filter = {};

    if (searchEmail) {
      filter.email = { $regex: searchEmail, $options: 'i' };
    }

    const total = await Reader.countDocuments(filter);

    const readers = await Reader.find(filter)
      .select('fullName email isActive isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        readers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        search: {
          searchEmail: searchEmail || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPublishersForAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const searchEmail = String(req.query.searchEmail || '').trim().toLowerCase();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 50, 100));
    const skip = (page - 1) * limit;
    const filter = {};

    if (searchEmail) {
      filter.email = { $regex: searchEmail, $options: 'i' };
    }

    const total = await Publisher.countDocuments(filter);

    const publishers = await Publisher.find(filter)
      .select('publisherName fullName email isActive isApproved isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        publishers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        search: {
          searchEmail: searchEmail || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePublisherActiveStatus = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { id } = req.params;
    const isActive = req.body.isActive;

    const publisher = await Publisher.findByIdAndUpdate(
      id,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    )
      .select('publisherName fullName email isActive isApproved isEmailVerified createdAt')
      .lean();

    if (!publisher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Publisher not found.',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Publisher ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        publisher,
      },
    });
  } catch (error) {
    next(error);
  }
};

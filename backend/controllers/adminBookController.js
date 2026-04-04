import Book from '../models/Book.js';
import { HTTP_STATUS } from '../config/constants.js';

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.constructor?.modelName !== 'Admin') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Only admins can access book management.',
    });
    return false;
  }
  return true;
};

export const getAllBooksForAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const books = await Book.find({})
      .populate('publisher', 'publisherName fullName email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookAdminControls = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { id } = req.params;
    const { isFeatured, visibility } = req.body;

    const updates = {};

    if (typeof isFeatured === 'boolean') {
      updates.isFeatured = isFeatured;
    }

    if (visibility !== undefined) {
      if (!['public', 'private'].includes(visibility)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Visibility must be either public or private.',
        });
      }
      updates.visibility = visibility;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'At least one field is required (isFeatured or visibility).',
      });
    }

    const book = await Book.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate('publisher', 'publisherName fullName email');

    if (!book) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Book not found.',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Book updated successfully.',
      data: {
        book,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBookAsAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Book not found.',
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Book deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

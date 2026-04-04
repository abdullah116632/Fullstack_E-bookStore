import Book from '../models/Book.js';
import Order from '../models/Order.js';
import { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';
import { runAutoActivation } from '../utils/purchaseActivation.js';

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.constructor?.modelName !== 'Admin') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Only admins can access purchase management.',
    });
    return false;
  }
  return true;
};

export const getAllPurchasesForAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    await runAutoActivation();

    const status = String(req.query.status || 'all').toLowerCase();
    const filter = {};

    if (status === 'pending') {
      filter.status = ORDER_STATUS.PENDING;
      filter.paymentStatus = PAYMENT_STATUS.PENDING;
      filter['accessControl.isUnlocked'] = false;
    } else if (status === 'approved') {
      filter.status = ORDER_STATUS.COMPLETED;
      filter['accessControl.isUnlocked'] = true;
    }

    const purchases = await Order.find(filter)
      .populate('buyer', 'fullName email')
      .populate('books.bookId', 'title author price')
      .populate('accessControl.approvedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        purchases,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const approvePurchaseByAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { id } = req.params;

    const purchase = await Order.findById(id);
    if (!purchase) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Purchase not found.',
      });
    }

    if (purchase.accessControl?.isUnlocked) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Purchase is already approved.',
      });
    }

    purchase.status = ORDER_STATUS.COMPLETED;
    purchase.paymentStatus = PAYMENT_STATUS.COMPLETED;
    purchase.completedAt = new Date();
    purchase.accessControl = {
      isUnlocked: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    };

    await purchase.save();

    const uniqueBookIds = Array.from(new Set(purchase.books.map((item) => String(item.bookId))));
    await Promise.all(
      uniqueBookIds.map((bookId) => Book.updateOne({ _id: bookId }, { $inc: { saleCount: 1 } }))
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Purchase approved. Book access unlocked for the reader.',
      data: {
        purchaseId: purchase._id,
        status: purchase.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivatePurchaseByAdmin = async (req, res, next) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { id } = req.params;
    const reason = String(req.body?.reason || '').trim() || 'deactivated-by-admin';

    const purchase = await Order.findById(id);
    if (!purchase) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Purchase not found.',
      });
    }

    if (!purchase.accessControl?.isUnlocked) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Purchase is already locked.',
      });
    }

    purchase.status = ORDER_STATUS.CANCELLED;
    purchase.paymentStatus = PAYMENT_STATUS.COMPLETED;
    purchase.cancelledAt = new Date();
    purchase.cancelReason = 'deactivated-by-admin';
    purchase.accessControl = {
      ...(purchase.accessControl || {}),
      isUnlocked: false,
      deactivatedBy: req.user._id,
      deactivatedAt: new Date(),
      deactivatedReason: reason,
    };

    await purchase.save();

    const uniqueBookIds = Array.from(new Set(purchase.books.map((item) => String(item.bookId))));
    await Promise.all(
      uniqueBookIds.map((bookId) =>
        Book.updateOne({ _id: bookId }, { $inc: { saleCount: -1 } })
      )
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Purchase deactivated and book access locked again.',
      data: {
        purchaseId: purchase._id,
        status: purchase.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

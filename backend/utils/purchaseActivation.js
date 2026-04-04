import Book from '../models/Book.js';
import Order from '../models/Order.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const AUTO_ACTIVATION_MINUTES = Number(process.env.PURCHASE_AUTO_ACTIVATION_MINUTES || 60);
const AUTO_ACTIVATION_RUN_INTERVAL_MS = Number(process.env.PURCHASE_AUTO_ACTIVATION_INTERVAL_MS || 60000);

let isRunningAutoActivation = false;
let autoActivationTimer = null;

const getActivationThresholdDate = () => {
  return new Date(Date.now() - AUTO_ACTIVATION_MINUTES * 60 * 1000);
};

const getEligibleFilter = () => ({
  status: ORDER_STATUS.PENDING,
  paymentStatus: PAYMENT_STATUS.PENDING,
  'accessControl.isUnlocked': false,
  cancelReason: { $ne: 'deactivated-by-admin' },
  createdAt: { $lte: getActivationThresholdDate() },
});

export const runAutoActivation = async () => {
  if (isRunningAutoActivation) {
    return { activatedCount: 0, skipped: true };
  }

  isRunningAutoActivation = true;

  try {
    const eligibleOrders = await Order.find(getEligibleFilter()).select('_id books').lean();

    if (!eligibleOrders.length) {
      return { activatedCount: 0, skipped: false };
    }

    const orderIds = eligibleOrders.map((order) => order._id);
    const now = new Date();

    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: {
          status: ORDER_STATUS.COMPLETED,
          paymentStatus: PAYMENT_STATUS.COMPLETED,
          completedAt: now,
          'accessControl.isUnlocked': true,
          'accessControl.autoActivated': true,
          'accessControl.approvedBy': null,
          'accessControl.approvedAt': now,
          'accessControl.deactivatedBy': null,
          'accessControl.deactivatedAt': null,
          'accessControl.deactivatedReason': null,
        },
      }
    );

    const bookFrequencyMap = new Map();
    eligibleOrders.forEach((order) => {
      order.books.forEach((item) => {
        const bookId = String(item.bookId);
        bookFrequencyMap.set(bookId, (bookFrequencyMap.get(bookId) || 0) + 1);
      });
    });

    await Promise.all(
      Array.from(bookFrequencyMap.entries()).map(([bookId, count]) =>
        Book.updateOne({ _id: bookId }, { $inc: { saleCount: count } })
      )
    );

    return { activatedCount: orderIds.length, skipped: false };
  } finally {
    isRunningAutoActivation = false;
  }
};

export const startAutoActivationJob = () => {
  if (autoActivationTimer) return;

  autoActivationTimer = setInterval(async () => {
    try {
      await runAutoActivation();
    } catch (error) {
      console.error('Auto activation job failed:', error.message);
    }
  }, AUTO_ACTIVATION_RUN_INTERVAL_MS);
};

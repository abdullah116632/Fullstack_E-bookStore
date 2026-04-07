import mongoose from 'mongoose';
import crypto from 'crypto';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const purchaseSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reader',
      required: [true, 'Buyer is required'],
    },
    buyerEmail: {
      type: String,
      required: [true, 'Buyer email is required'],
      lowercase: true,
      trim: true,
    },
    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
        _id: false,
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: [true, 'Final amount is required'],
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: ['bkash', 'nagad', 'rocket', 'upay'],
      required: true,
    },
    paymentDetails: {
      senderMobileNumber: {
        type: String,
        required: [true, 'Sender mobile number is required'],
      },
      transactionId: {
        type: String,
        required: [true, 'Transaction ID is required'],
      },
      gateway: {
        type: String,
        enum: ['bkash', 'nagad', 'rocket', 'upay'],
      },
      receiverMobileNumber: {
        type: String,
        default: '01768899941',
      },
    },
    accessControl: {
      isUnlocked: {
        type: Boolean,
        default: false,
      },
      autoActivated: {
        type: Boolean,
        default: false,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      },
      approvedAt: Date,
      deactivatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      },
      deactivatedAt: Date,
      deactivatedReason: String,
    },
    notes: String,
    cancelReason: String,
    cancelledAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number before saving
purchaseSchema.pre('save', async function (next) {
  if (!this.isNew || this.orderNumber) return next();

  try {
    const PurchaseModel = mongoose.model('Purchase');
    const MAX_ATTEMPTS = 10;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      // 10-char uppercase alphanumeric random segment.
      const randomSegment = crypto
        .randomBytes(8)
        .toString('base64url')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 10);

      const candidate = `ORD-${randomSegment}`;
      // eslint-disable-next-line no-await-in-loop
      const existing = await PurchaseModel.findOne({ orderNumber: candidate }).select('_id').lean();

      if (!existing) {
        this.orderNumber = candidate;
        break;
      }
    }

    if (!this.orderNumber) {
      throw new Error('Failed to generate a unique order number.');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Index for faster queries
purchaseSchema.index({ buyer: 1, createdAt: -1 });
purchaseSchema.index({ buyerEmail: 1, createdAt: -1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ paymentStatus: 1 });
purchaseSchema.index({ 'books.bookId': 1, buyer: 1 });
purchaseSchema.index({ 'paymentDetails.transactionId': 1 }, { unique: true, sparse: true });

export default mongoose.model('Purchase', purchaseSchema, 'purches');

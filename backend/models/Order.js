import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
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
      enum: ['credit-card', 'debit-card', 'paypal', 'stripe'],
      required: true,
    },
    paymentDetails: {
      transactionId: String,
      gateway: String,
      receiptUrl: String,
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    billingAddress: {
      fullName: String,
      phone: String,
      email: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
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
orderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    const count = await mongoose.model('Order').countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Index for faster queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.model('Order', orderSchema);

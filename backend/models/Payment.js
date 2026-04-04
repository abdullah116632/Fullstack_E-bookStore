import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR'],
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['credit-card', 'debit-card', 'paypal', 'stripe', 'bank-transfer'],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    gateway: {
      type: String,
      enum: ['stripe', 'paypal', 'razorpay', 'manual'],
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    receiptUrl: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: String,
    refundedAt: Date,
    failureReason: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

export default mongoose.model('Payment', paymentSchema);

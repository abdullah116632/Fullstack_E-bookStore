import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      trim: true,
      minlength: [5, 'Review title must be at least 5 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [5000, 'Review cannot exceed 5000 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same user for same book
reviewSchema.index({ book: 1, reviewer: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ book: 1, status: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });

export default mongoose.model('Review', reviewSchema);

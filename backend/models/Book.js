import mongoose from 'mongoose';
import { BOOK_STATUS } from '../config/constants.js';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Book description is required'],
      validate: {
        validator: function (value) {
          return value.trim().split(/\s+/).filter(Boolean).length >= 100;
        },
        message: 'Book description must be at least 100 words',
      },
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publisher',
      required: [true, 'Publisher is required'],
    },
    category: {
      type: String,
      default: 'other',
      enum: [
        'fiction',
        'non-fiction',
        'science',
        'history',
        'biography',
        'mystery',
        'romance',
        'fantasy',
        'education',
        'business',
        'self-help',
        'other',
      ],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    coverImagePublicId: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    pages: {
      type: Number,
      default: 1,
      min: [1, 'Pages must be at least 1'],
    },
    language: {
      type: String,
      default: 'English',
      enum: ['English', 'Arabic', 'French', 'Spanish', 'German', 'Chinese', 'Japanese', 'Hindi'],
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required (PDF or EPUB)'],
    },
    filePublicId: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'epub', 'mobi'],
      default: 'pdf',
    },
    status: {
      type: String,
      enum: Object.values(BOOK_STATUS),
      default: BOOK_STATUS.DRAFT,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    saleCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    discount: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      validFrom: Date,
      validTo: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'draft'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
bookSchema.index({ publisher: 1, status: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ title: 'text', description: 'text', author: 'text' });

export default mongoose.model('Book', bookSchema);

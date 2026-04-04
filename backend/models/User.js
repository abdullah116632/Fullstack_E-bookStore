import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.READER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // OTP for signup verification
    signupOTP: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
    // OTP for password reset
    resetOTP: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Publisher specific fields (MVP - minimal)
    publisherInfo: {
      publisherName: String,
      phoneNumber: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to get user public data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.signupOTP;
  delete obj.resetOTP;
  return obj;
};

export default mongoose.model('User', userSchema);

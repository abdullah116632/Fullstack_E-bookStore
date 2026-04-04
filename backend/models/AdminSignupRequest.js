import mongoose from 'mongoose';

const adminSignupRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    otp: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Keep pending requests short-lived.
adminSignupRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

export default mongoose.model('AdminSignupRequest', adminSignupRequestSchema);

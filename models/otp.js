import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    // required: true,
    lowercase: true,
  },
  phone: { type: String },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // 15 minutes
  },
});

export default mongoose.model('Otp', otpSchema);

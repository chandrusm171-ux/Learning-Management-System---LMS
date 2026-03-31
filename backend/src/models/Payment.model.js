import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  platformFee: { type: Number, default: 0 },
  instructorEarning: { type: Number, default: 0 },
  gateway: { type: String, enum: ['razorpay', 'stripe', 'free'], required: true },
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  refundedAt: { type: Date },
  refundReason: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
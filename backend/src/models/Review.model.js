import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 200, default: '' },
  comment: { type: String, maxlength: 2000, default: '' },
  instructorReply: { type: String, default: '' },
  instructorRepliedAt: { type: Date },
  isVerifiedPurchase: { type: Boolean, default: true },
  helpfulVotes: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ course: 1, student: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
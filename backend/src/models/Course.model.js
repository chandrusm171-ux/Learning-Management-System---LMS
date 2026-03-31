import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, unique: true, lowercase: true },
  subtitle: { type: String, maxlength: 300, default: '' },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  thumbnail: { type: String, default: '' },
  previewVideo: { type: String, default: '' },
  price: { type: Number, default: 0, min: 0 },
  discountPrice: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'beginner' },
  language: { type: String, default: 'English' },
  tags: [{ type: String }],
  requirements: [{ type: String }],
  objectives: [{ type: String }],
  targetAudience: [{ type: String }],
  status: { type: String, enum: ['draft', 'pending', 'published', 'rejected', 'archived'], default: 'draft' },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, default: '' },
  totalDuration: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  totalSections: { type: Number, default: 0 },
  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  certificate: { type: Boolean, default: true },
  welcomeMessage: { type: String, default: '' },
  congratsMessage: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ category: 1, status: 1 });

export default mongoose.model('Course', courseSchema);
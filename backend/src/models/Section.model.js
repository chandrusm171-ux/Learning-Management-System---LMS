import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true, default: 0 },
  isPublished: { type: Boolean, default: false },
  totalDuration: { type: Number, default: 0 },
  lessonCount: { type: Number, default: 0 },
}, { timestamps: true });

sectionSchema.index({ course: 1, order: 1 });

export default mongoose.model('Section', sectionSchema);
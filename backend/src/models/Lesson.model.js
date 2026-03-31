import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'doc', 'zip', 'link', 'other'], default: 'other' },
  size: { type: Number, default: 0 },
});

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['video', 'article', 'quiz'], default: 'video' },
  videoUrl: { type: String, default: '' },
  videoPublicId: { type: String, default: '' },
  videoDuration: { type: Number, default: 0 },
  videoThumbnail: { type: String, default: '' },
  article: { type: String, default: '' },
  resources: [resourceSchema],
  order: { type: Number, required: true, default: 0 },
  isPublished: { type: Boolean, default: false },
  isFreePreview: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

lessonSchema.index({ course: 1, section: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);
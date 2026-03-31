import mongoose from 'mongoose';

const progressItemSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  watchedDuration: { type: Number, default: 0 },
  lastPosition: { type: Number, default: 0 },
}, { _id: false });

const noteSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  content: { type: String, required: true },
  timestamp: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  pricePaid: { type: Number, default: 0 },
  progress: [progressItemSchema],
  completedLessons: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  lastAccessedAt: { type: Date },
  certificateIssued: { type: Boolean, default: false },
  certificateUrl: { type: String, default: '' },
  notes: [noteSchema],
  status: { type: String, enum: ['active', 'refunded', 'suspended'], default: 'active' },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
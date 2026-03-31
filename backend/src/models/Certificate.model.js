import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  certificateId: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  courseName: { type: String, required: true },
  instructorName: { type: String, required: true },
  completionDate: { type: Date, required: true },
  pdfUrl: { type: String, default: '' },
  isValid: { type: Boolean, default: true },
}, { timestamps: true });

certificateSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Certificate', certificateSchema);
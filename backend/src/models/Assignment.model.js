import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructions: { type: String, default: '' },
  type: { type: String, enum: ['file', 'text', 'link', 'quiz'], default: 'text' },
  totalPoints: { type: Number, default: 100 },
  passingPoints: { type: Number, default: 60 },
  rubric: [{
    criteria: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String, default: '' },
  }],
  dueDate: { type: Date },
  allowLateSubmission: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  submissionCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
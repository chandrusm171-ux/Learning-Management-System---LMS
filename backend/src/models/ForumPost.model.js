import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isInstructorReply: { type: Boolean, default: false },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAnswer: { type: Boolean, default: false },
}, { timestamps: true });

const forumPostSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  content: { type: String, required: true },
  type: { type: String, enum: ['question', 'discussion', 'announcement'], default: 'question' },
  tags: [{ type: String }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [replySchema],
  replyCount: { type: Number, default: 0 },
  isAnswered: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ForumPost', forumPostSchema);
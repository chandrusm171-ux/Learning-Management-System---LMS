import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  color: { type: String, default: '#7c3aed' },
  isActive: { type: Boolean, default: true },
  courseCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
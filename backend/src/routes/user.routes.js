import express from 'express';
import User from '../models/User.model.js';
import Course from '../models/Course.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public instructor profile
router.get('/:id/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name avatar bio headline website socialLinks role createdAt');
  const courses = await Course.find({ instructor: req.params.id, status: 'published' })
    .select('title thumbnail rating enrollmentCount price slug');
  successResponse(res, { user, courses });
}));

// Toggle wishlist
router.patch('/wishlist/:courseId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courseId = req.params.courseId;
  const idx = user.wishlist.indexOf(courseId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(courseId);
  }
  await user.save();
  successResponse(res, { wishlist: user.wishlist }, idx > -1 ? 'Removed from wishlist' : 'Added to wishlist');
}));

export default router;
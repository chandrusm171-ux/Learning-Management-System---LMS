import express from 'express';
import {
  getCourseReviews, createReview, updateReview, deleteReview, replyToReview,
} from '../controllers/review.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:courseId', getCourseReviews);
router.post('/:courseId', protect, createReview);
router.patch('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.patch('/:id/reply', protect, restrictTo('instructor', 'admin'), replyToReview);

export default router;
import Review from '../models/Review.model.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const updateCourseRating = async (courseId) => {
  const stats = await Review.aggregate([
    { $match: { course: courseId, isPublished: true } },
    { $group: { _id: '$course', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
};

export const getCourseReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  const sortOptions = { newest: { createdAt: -1 }, helpful: { helpfulVotes: -1 }, rating_high: { rating: -1 }, rating_low: { rating: 1 } };

  const reviews = await Review.find({ course: req.params.courseId, isPublished: true })
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('student', 'name avatar');

  const total = await Review.countDocuments({ course: req.params.courseId, isPublished: true });
  successResponse(res, { reviews, total });
});

export const createReview = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrollment) throw new AppError('You must be enrolled to review', 403);

  const existing = await Review.findOne({ student: req.user._id, course: courseId });
  if (existing) throw new AppError('Already reviewed this course', 400);

  const review = await Review.create({ ...req.body, student: req.user._id, course: courseId });
  await updateCourseRating(review.course);
  successResponse(res, { review }, 'Review submitted', 201);
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, student: req.user._id },
    req.body,
    { new: true }
  );
  if (!review) throw new AppError('Review not found', 404);
  await updateCourseRating(review.course);
  successResponse(res, { review }, 'Review updated');
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, student: req.user._id });
  if (!review) throw new AppError('Review not found', 404);
  await updateCourseRating(review.course);
  successResponse(res, null, 'Review deleted');
});

export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  review.instructorReply = req.body.reply;
  review.instructorRepliedAt = new Date();
  await review.save();
  successResponse(res, { review }, 'Reply added');
});
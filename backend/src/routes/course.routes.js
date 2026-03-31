import express from 'express';
import {
  getCourses, getCourseBySlug, createCourse, updateCourse,
  deleteCourse, getMyCourses, submitCourseForReview, getCourseAnalytics,
} from '../controllers/course.controller.js';
import {
  getSections, createSection, updateSection, deleteSection, reorderSections,
} from '../controllers/section.controller.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import Course from '../models/Course.model.js';
import Section from '../models/Section.model.js';
import Lesson from '../models/Lesson.model.js';
import Enrollment from '../models/Enrollment.model.js';

const router = express.Router();

// ── Public routes ──────────────────────────────────────────────
router.get('/', optionalAuth, getCourses);
router.get('/my-courses', protect, restrictTo('instructor', 'admin'), getMyCourses);
router.get('/analytics', protect, restrictTo('instructor', 'admin'), getCourseAnalytics);

// Get course by MongoDB ID (for course player)
router.get('/by-id/:id', optionalAuth, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name avatar bio headline website socialLinks')
    .populate('category', 'name slug');

  if (!course) throw new AppError('Course not found', 404);

  const sections = await Section.find({ course: course._id }).sort('order').lean();
  const lessons = await Lesson.find({ course: course._id }).sort('order')
    .select('title type videoDuration isFreePreview order section videoUrl description');

  const curriculum = sections.map((section) => ({
    ...section,
    lessons: lessons.filter(
      (l) => l.section.toString() === section._id.toString()
    ),
  }));

  let isEnrolled = false;
  if (req.user) {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });
    isEnrolled = !!enrollment;
  }

  successResponse(res, { course, curriculum, isEnrolled });
}));

// Get course by slug (for course detail page)
router.get('/:slug', optionalAuth, getCourseBySlug);

// ── Instructor routes ───────────────────────────────────────────
router.post('/', protect, restrictTo('instructor', 'admin'), createCourse);
router.patch('/:id', protect, restrictTo('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, restrictTo('instructor', 'admin'), deleteCourse);
router.patch('/:id/submit', protect, restrictTo('instructor', 'admin'), submitCourseForReview);

// ── Section routes ──────────────────────────────────────────────
router.get('/:courseId/sections', getSections);
router.post('/:courseId/sections', protect, restrictTo('instructor', 'admin'), createSection);
router.patch('/sections/:id', protect, updateSection);
router.delete('/sections/:id', protect, deleteSection);
router.patch('/:courseId/sections/reorder', protect, reorderSections);

export default router;
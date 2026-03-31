import Lesson from '../models/Lesson.model.js';
import Section from '../models/Section.model.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/apiResponse.js';

export const getLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ section: req.params.sectionId }).sort('order');
  successResponse(res, { lessons });
});

export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course', 'instructor');
  if (!lesson) throw new AppError('Lesson not found', 404);

  // Check access
  if (!lesson.isFreePreview) {
    if (!req.user) throw new AppError('Login required', 401);
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course._id,
    });
    const isInstructor = lesson.course.instructor.toString() === req.user._id.toString();
    if (!enrollment && !isInstructor && req.user.role !== 'admin')
      throw new AppError('Enroll to access this lesson', 403);
  }

  await Lesson.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
  successResponse(res, { lesson });
});

export const createLesson = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.sectionId);
  if (!section) throw new AppError('Section not found', 404);

  const count = await Lesson.countDocuments({ section: section._id });
  const lesson = await Lesson.create({
    ...req.body,
    course: section.course,
    section: section._id,
    order: count,
  });

  await Course.findByIdAndUpdate(section.course, { $inc: { totalLessons: 1 } });
  await Section.findByIdAndUpdate(section._id, { $inc: { lessonCount: 1 } });

  successResponse(res, { lesson }, 'Lesson created', 201);
});

export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lesson) throw new AppError('Lesson not found', 404);
  successResponse(res, { lesson }, 'Lesson updated');
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) throw new AppError('Lesson not found', 404);
  await Course.findByIdAndUpdate(lesson.course, { $inc: { totalLessons: -1 } });
  await Section.findByIdAndUpdate(lesson.section, { $inc: { lessonCount: -1 } });
  successResponse(res, null, 'Lesson deleted');
});

export const reorderLessons = asyncHandler(async (req, res) => {
  const { lessons } = req.body;
  await Promise.all(
    lessons.map(({ id, order }) => Lesson.findByIdAndUpdate(id, { order }))
  );
  successResponse(res, null, 'Lessons reordered');
});
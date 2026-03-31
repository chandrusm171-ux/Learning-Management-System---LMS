import Section from '../models/Section.model.js';
import Course from '../models/Course.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/apiResponse.js';

export const getSections = asyncHandler(async (req, res) => {
  const sections = await Section.find({ course: req.params.courseId }).sort('order');
  successResponse(res, { sections });
});

export const createSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor.toString() !== req.user._id.toString())
    throw new AppError('Not authorized', 403);

  const count = await Section.countDocuments({ course: course._id });
  const section = await Section.create({
    ...req.body,
    course: course._id,
    order: count,
  });

  await Course.findByIdAndUpdate(course._id, { $inc: { totalSections: 1 } });
  successResponse(res, { section }, 'Section created', 201);
});

export const updateSection = asyncHandler(async (req, res) => {
  const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!section) throw new AppError('Section not found', 404);
  successResponse(res, { section }, 'Section updated');
});

export const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findByIdAndDelete(req.params.id);
  if (!section) throw new AppError('Section not found', 404);
  await Course.findByIdAndUpdate(section.course, { $inc: { totalSections: -1 } });
  successResponse(res, null, 'Section deleted');
});

export const reorderSections = asyncHandler(async (req, res) => {
  const { sections } = req.body; // [{ id, order }]
  await Promise.all(
    sections.map(({ id, order }) => Section.findByIdAndUpdate(id, { order }))
  );
  successResponse(res, null, 'Sections reordered');
});
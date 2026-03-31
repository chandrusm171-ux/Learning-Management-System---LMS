import Course from '../models/Course.model.js';
import Category from '../models/Category.model.js';
import Section from '../models/Section.model.js';
import Lesson from '../models/Lesson.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import slugify from 'slugify';

// Public: get all published courses with filters
export const getCourses = asyncHandler(async (req, res) => {
  const {
    search, category, level, minPrice, maxPrice,
    rating, sort, page = 1, limit = 12, free
  } = req.query;

  const filter = { status: 'published', isApproved: true };

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (free === 'true') filter.isFree = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) filter.rating = { $gte: Number(rating) };

  const sortOptions = {
    newest: { createdAt: -1 },
    popular: { enrollmentCount: -1 },
    rating: { rating: -1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate('instructor', 'name avatar headline')
      .populate('category', 'name slug')
      .select('-description -requirements -objectives'),
    Course.countDocuments(filter),
  ]);

  successResponse(res, {
    courses,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

// Public: get single course by slug
export const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate('instructor', 'name avatar bio headline website socialLinks')
    .populate('category', 'name slug');

  if (!course) throw new AppError('Course not found', 404);

  const sections = await Section.find({ course: course._id })
    .sort('order')
    .lean();

  const lessons = await Lesson.find({ course: course._id })
    .sort('order')
    .select('title type videoDuration isFreePreview order section');

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
});

// Instructor: create course
export const createCourse = asyncHandler(async (req, res) => {
  const { title, category } = req.body;

  const slug = slugify(title, { lower: true, strict: true }) +
    '-' + Date.now().toString().slice(-5);

  const course = await Course.create({
    ...req.body,
    slug,
    instructor: req.user._id,
    status: 'draft',
  });

  await Category.findByIdAndUpdate(category, { $inc: { courseCount: 1 } });

  successResponse(res, { course }, 'Course created', 201);
});

// Instructor: update course
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);

  if (course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  if (req.body.title && req.body.title !== course.title) {
    req.body.slug = slugify(req.body.title, { lower: true, strict: true }) +
      '-' + Date.now().toString().slice(-5);
  }

  req.body.lastUpdated = new Date();
  const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });

  successResponse(res, { course: updated }, 'Course updated');
});

// Instructor: submit for review
export const submitCourseForReview = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor.toString() !== req.user._id.toString())
    throw new AppError('Not authorized', 403);

  course.status = 'pending';
  await course.save();
  successResponse(res, { course }, 'Course submitted for review');
});

// Instructor: get my courses
export const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id })
    .populate('category', 'name')
    .sort({ createdAt: -1 });
  successResponse(res, { courses });
});

// Instructor: delete course
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin')
    throw new AppError('Not authorized', 403);

  await course.deleteOne();
  successResponse(res, null, 'Course deleted');
});

// Instructor: analytics
export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const courses = await Course.find({ instructor: instructorId })
    .select('title enrollmentCount revenue rating reviewCount thumbnail status');

  const totalStudents = courses.reduce((a, c) => a + c.enrollmentCount, 0);
  const totalRevenue = courses.reduce((a, c) => a + c.revenue, 0);
  const avgRating = courses.length
    ? (courses.reduce((a, c) => a + c.rating, 0) / courses.length).toFixed(1)
    : 0;

  const recentEnrollments = await Enrollment.find({
    course: { $in: courses.map((c) => c._id) },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('student', 'name avatar')
    .populate('course', 'title thumbnail');

  successResponse(res, {
    summary: { totalStudents, totalRevenue, avgRating, totalCourses: courses.length },
    courses,
    recentEnrollments,
  });
});
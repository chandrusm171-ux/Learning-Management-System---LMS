import Enrollment from '../models/Enrollment.model.js';
import Course from '../models/Course.model.js';
import Lesson from '../models/Lesson.model.js';
import Notification from '../models/Notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { getIO } from '../sockets/index.js';

export const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (!course.isFree) throw new AppError('This is a paid course. Please complete payment.', 400);

  const exists = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (exists) throw new AppError('Already enrolled', 400);

  const lessons = await Lesson.find({ course: course._id }).select('_id');
  const progress = lessons.map((l) => ({ lesson: l._id, completed: false }));

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    pricePaid: 0,
    totalLessons: lessons.length,
    progress,
  });

  await Course.findByIdAndUpdate(course._id, { $inc: { enrollmentCount: 1 } });

  // Notify instructor
  const notification = await Notification.create({
    recipient: course.instructor,
    sender: req.user._id,
    type: 'enrollment',
    title: 'New Enrollment',
    message: `${req.user.name} enrolled in "${course.title}"`,
    link: `/instructor/courses/${course._id}`,
  });

  try {
    getIO().to(`user-${course.instructor}`).emit('notification', notification);
  } catch {}

  successResponse(res, { enrollment }, 'Enrolled successfully', 201);
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id, status: 'active' })
    .populate({
      path: 'course',
      select: 'title thumbnail instructor rating totalLessons totalDuration slug',
      populate: { path: 'instructor', select: 'name avatar' },
    })
    .sort({ lastAccessedAt: -1 });

  successResponse(res, { enrollments });
});

export const getEnrollmentProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  }).populate('lastAccessedLesson', 'title section order');

  if (!enrollment) throw new AppError('Not enrolled', 404);
  successResponse(res, { enrollment });
});

export const updateLessonProgress = asyncHandler(async (req, res) => {
  const { lessonId, completed, lastPosition, watchedDuration } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });
  if (!enrollment) throw new AppError('Not enrolled', 404);

  const progressItem = enrollment.progress.find(
    (p) => p.lesson.toString() === lessonId
  );

  if (progressItem) {
    if (completed !== undefined) progressItem.completed = completed;
    if (completed && !progressItem.completedAt) progressItem.completedAt = new Date();
    if (lastPosition !== undefined) progressItem.lastPosition = lastPosition;
    if (watchedDuration !== undefined) progressItem.watchedDuration = watchedDuration;
  }

  enrollment.lastAccessedLesson = lessonId;
  enrollment.lastAccessedAt = new Date();

  const completedCount = enrollment.progress.filter((p) => p.completed).length;
  enrollment.completedLessons = completedCount;
  enrollment.completionPercentage = enrollment.totalLessons > 0
    ? Math.round((completedCount / enrollment.totalLessons) * 100)
    : 0;

  if (enrollment.completionPercentage === 100 && !enrollment.isCompleted) {
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  successResponse(res, { enrollment }, 'Progress updated');
});

export const addNote = asyncHandler(async (req, res) => {
  const { lessonId, content, timestamp } = req.body;
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });
  if (!enrollment) throw new AppError('Not enrolled', 404);

  enrollment.notes.push({ lesson: lessonId, content, timestamp });
  await enrollment.save();
  successResponse(res, { notes: enrollment.notes }, 'Note added');
});

export const deleteNote = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });
  if (!enrollment) throw new AppError('Not enrolled', 404);

  enrollment.notes = enrollment.notes.filter(
    (n) => n._id.toString() !== req.params.noteId
  );
  await enrollment.save();
  successResponse(res, null, 'Note deleted');
});
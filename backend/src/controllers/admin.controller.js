import User from '../models/User.model.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import Payment from '../models/Payment.model.js';
import Category from '../models/Category.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, totalEnrollments, revenueData] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Enrollment.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt avatar');
  const pendingCourses = await Course.find({ status: 'pending' })
    .populate('instructor', 'name avatar')
    .populate('category', 'name')
    .limit(10);

  successResponse(res, { totalUsers, totalCourses, totalEnrollments, totalRevenue, recentUsers, pendingCourses });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  successResponse(res, { users, total });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  successResponse(res, { user }, 'Role updated');
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: req.body.ban },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);
  successResponse(res, { user }, `User ${req.body.ban ? 'banned' : 'unbanned'}`);
});

export const getPendingCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'pending' })
    .populate('instructor', 'name email avatar')
    .populate('category', 'name')
    .sort({ createdAt: -1 });
  successResponse(res, { courses });
});

export const approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'published', isApproved: true, approvedAt: new Date(), approvedBy: req.user._id },
    { new: true }
  );
  if (!course) throw new AppError('Course not found', 404);
  successResponse(res, { course }, 'Course approved');
});

export const rejectCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: req.body.reason },
    { new: true }
  );
  if (!course) throw new AppError('Course not found', 404);
  successResponse(res, { course }, 'Course rejected');
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  successResponse(res, { categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  successResponse(res, { category }, 'Category created', 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new AppError('Category not found', 404);
  successResponse(res, { category }, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  successResponse(res, null, 'Category deleted');
});

export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [monthlyEnrollments, monthlyRevenue, userGrowth, topCourses, roleStats] = await Promise.all([
    Enrollment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Course.find({ status: 'published' })
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .select('title enrollmentCount revenue rating'),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatMonthly = (data, valueKey = 'count') => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = data.find((x) => x._id.year === year && x._id.month === month);
      result.push({
        month: months[month - 1],
        value: found ? (found[valueKey] || 0) : 0,
      });
    }
    return result;
  };

  successResponse(res, {
    monthlyEnrollments: formatMonthly(monthlyEnrollments, 'count'),
    monthlyRevenue: formatMonthly(monthlyRevenue, 'revenue'),
    userGrowth: formatMonthly(userGrowth, 'count'),
    topCourses,
    roleStats,
  });
});
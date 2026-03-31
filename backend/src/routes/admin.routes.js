import express from 'express';
import {
  getDashboardStats, getAllUsers, updateUserRole, banUser,
  getPendingCourses, approveCourse, rejectCourse,
  getCategories, createCategory, updateCategory, deleteCategory,
  getRevenueAnalytics,
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';



const router = express.Router();

// PUBLIC — anyone can get categories
router.get('/categories', getCategories);;

// ADMIN ONLY below this line
router.use(protect, restrictTo('admin'));

router.get('/stats', getDashboardStats);
router.get('/analytics', getRevenueAnalytics);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', banUser);
router.get('/courses/pending', getPendingCourses);
router.patch('/courses/:id/approve', approveCourse);
router.patch('/courses/:id/reject', rejectCourse);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);


export default router;
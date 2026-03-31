import express from 'express';
import {
  getLessons, getLessonById, createLesson,
  updateLesson, deleteLesson, reorderLessons,
} from '../controllers/lesson.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/section/:sectionId', getLessons);
router.get('/:id', optionalAuth, getLessonById);
router.post('/section/:sectionId', protect, createLesson);
router.patch('/:id', protect, updateLesson);
router.delete('/:id', protect, deleteLesson);
router.patch('/section/:sectionId/reorder', protect, reorderLessons);

export default router;
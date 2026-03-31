import express from 'express';
import {
  enrollInCourse, getMyEnrollments, getEnrollmentProgress,
  updateLessonProgress, addNote, deleteNote,
} from '../controllers/enrollment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.post('/:courseId/enroll', enrollInCourse);
router.get('/my', getMyEnrollments);
router.get('/:courseId/progress', getEnrollmentProgress);
router.patch('/:courseId/progress', updateLessonProgress);
router.post('/:courseId/notes', addNote);
router.delete('/:courseId/notes/:noteId', deleteNote);

export default router;
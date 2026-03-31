import api from './axios.js';

// Public 
export const getCoursesAPI = (params) => api.get('/courses', { params });
export const getCourseBySlugAPI = (slug) => api.get(`/courses/${slug}`);
export const getCourseByIdAPI = (id) => api.get(`/courses/by-id/${id}`);
export const getCategoriesAPI = () => api.get('/admin/categories');

// Enrollment 
export const getMyEnrollmentsAPI = () => api.get('/enrollments/my');
export const enrollCourseAPI = (courseId) => api.post(`/enrollments/${courseId}/enroll`);
export const getCourseReviewsAPI = (courseId, params) => api.get(`/reviews/${courseId}`, { params });

// Instructor: Course management 
export const createCourseAPI = (data) => api.post('/courses', data);
export const updateCourseAPI = (id, data) => api.patch(`/courses/${id}`, data);
export const deleteCourseAPI = (id) => api.delete(`/courses/${id}`);
export const submitCourseAPI = (id) => api.patch(`/courses/${id}/submit`);
export const getMyCoursesAPI = () => api.get('/courses/my-courses');
export const getCourseAnalyticsAPI = () => api.get('/courses/analytics');

// Sections 
export const getSectionsAPI = (courseId) => api.get(`/courses/${courseId}/sections`);
export const createSectionAPI = (courseId, data) => api.post(`/courses/${courseId}/sections`, data);
export const updateSectionAPI = (id, data) => api.patch(`/courses/sections/${id}`, data);
export const deleteSectionAPI = (id) => api.delete(`/courses/sections/${id}`);
export const reorderSectionsAPI = (courseId, sections) =>
  api.patch(`/courses/${courseId}/sections/reorder`, { sections });

// Lessons 
export const getLessonsAPI = (sectionId) => api.get(`/lessons/section/${sectionId}`);
export const createLessonAPI = (sectionId, data) => api.post(`/lessons/section/${sectionId}`, data);
export const updateLessonAPI = (id, data) => api.patch(`/lessons/${id}`, data);
export const deleteLessonAPI = (id) => api.delete(`/lessons/${id}`);
export const reorderLessonsAPI = (sectionId, lessons) =>
  api.patch(`/lessons/section/${sectionId}/reorder`, { lessons });
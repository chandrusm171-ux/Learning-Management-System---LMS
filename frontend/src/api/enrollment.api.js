import api from './axios.js';

export const getEnrollmentProgressAPI = (courseId) => api.get(`/enrollments/${courseId}/progress`);
export const updateProgressAPI = (courseId, data) => api.patch(`/enrollments/${courseId}/progress`, data);
export const addNoteAPI = (courseId, data) => api.post(`/enrollments/${courseId}/notes`, data);
export const deleteNoteAPI = (courseId, noteId) => api.delete(`/enrollments/${courseId}/notes/${noteId}`);
export const getLessonAPI = (lessonId) => api.get(`/lessons/${lessonId}`);
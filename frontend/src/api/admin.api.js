import api from './axios.js';

export const getAdminStatsAPI = () => api.get('/admin/stats');
export const getAdminUsersAPI = (params) => api.get('/admin/users', { params });
export const updateUserRoleAPI = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const banUserAPI = (id, ban) => api.patch(`/admin/users/${id}/ban`, { ban });
export const getPendingCoursesAPI = () => api.get('/admin/courses/pending');
export const approveCourseAPI = (id) => api.patch(`/admin/courses/${id}/approve`);
export const rejectCourseAPI = (id, reason) => api.patch(`/admin/courses/${id}/reject`, { reason });
export const getCategoriesAdminAPI = () => api.get('/admin/categories');
export const createCategoryAPI = (data) => api.post('/admin/categories', data);
export const updateCategoryAPI = (id, data) => api.patch(`/admin/categories/${id}`, data);
export const deleteCategoryAPI = (id) => api.delete(`/admin/categories/${id}`);
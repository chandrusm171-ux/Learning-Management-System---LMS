import api from './axios.js';

export const registerAPI = (data) => api.post('/auth/register', data);
export const loginAPI = (data) => api.post('/auth/login', data);
export const getMeAPI = () => api.get('/auth/me');
export const updateMeAPI = (data) => api.patch('/auth/me', data);
export const changePasswordAPI = (data) => api.patch('/auth/change-password', data);
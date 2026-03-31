import axios from 'axios';

const getToken = () => {
  try {
    const stored = localStorage.getItem('lms-auth');
    if (stored) return JSON.parse(stored).state?.token;
  } catch {}
  return null;
};

export const uploadImageAPI = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axios.post('/api/v1/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return res.data.data;
};

export const uploadVideoAPI = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('video', file);
  const res = await axios.post('/api/v1/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return res.data.data;
};
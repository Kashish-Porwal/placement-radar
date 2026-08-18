import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const createApplication = async (data) => {
  const response = await api.post('/applications', data);
  return response.data;
};

export const updateApplicationStatus = async (id, status, interviewDate) => {
  const payload = { status };
  if (interviewDate !== undefined) payload.interviewDate = interviewDate;
  const response = await api.put(`/applications/${id}`, payload);
  return response.data;
};

export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

export const uploadResume = async (formData) => {
  const response = await api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const analyzeJD = async (applicationId, jdText) => {
  const response = await api.post('/resumes/analyze-jd', { applicationId, jdText });
  return response.data;
};

export const tailorResume = async (applicationId) => {
  const response = await api.post(`/resumes/tailor/${applicationId}`);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

export const toggleTwoFactor = async () => {
  const response = await api.post('/auth/toggle-2fa');
  return response.data;
};

export default api;

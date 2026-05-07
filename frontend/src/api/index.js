import api from './axios';

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const uploadResume = (formData) => api.post('/auth/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changePassword = (data) => api.put('/auth/change-password', data);

// Jobs
export const getJobs = (params) => api.get('/jobs', { params });
export const getJob = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const getMyJobs = () => api.get('/jobs/my-jobs');

// Applications
export const applyForJob = (jobId, formData) => api.post(`/applications/${jobId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyApplications = () => api.get('/applications/my');
export const getJobApplications = (jobId) => api.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id, data) => api.patch(`/applications/${id}/status`, data);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/toggle`);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminJobs = (params) => api.get('/admin/jobs', { params });
export const toggleJobStatus = (id) => api.patch(`/admin/jobs/${id}/toggle`);

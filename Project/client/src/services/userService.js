import api from './api';

const userService = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getReviews: (userId) => api.get(`/users/${userId}/reviews`),
  addReview: (userId, review) => api.post(`/users/${userId}/reviews`, review),
  getListings: (userId) => api.get(`/users/${userId}/listings`),
  getStats: () => api.get('/users/stats'),
  completeProfile: (data) => api.put('/users/complete-profile', data),
  // Admin
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  banUser: (userId) => api.put(`/admin/users/${userId}/ban`),
  getAdminStats: () => api.get('/admin/stats'),
  getDisputes: () => api.get('/admin/disputes'),
  resolveDispute: (id, resolution) => api.put(`/admin/disputes/${id}`, resolution),
};

export default userService;

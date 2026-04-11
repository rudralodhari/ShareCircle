import api from './api';

const itemService = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  search: (query) => api.get('/items/search', { params: { q: query } }),
  getNearby: (lat, lng, radius) => api.get('/items/nearby', { params: { lat, lng, radius } }),
  getByCategory: (category) => api.get('/items/category', { params: { category } }),
  getByType: (type) => api.get('/items/type', { params: { type } }),
  getRecommended: () => api.get('/items/recommended'),

  /** Upload images to server — saves to public/images/products/ */
  uploadImages: (imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append('images', file));
    return api.post('/items/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default itemService;

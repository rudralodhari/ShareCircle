import api from './api';

const orderService = {
  // Cart
  getCart: () => api.get('/orders/cart'),
  addToCart: (itemId) => api.post('/orders/cart', { itemId }),
  removeFromCart: (itemId) => api.delete(`/orders/cart/${itemId}`),
  // Wishlist
  getWishlist: () => api.get('/orders/wishlist'),
  addToWishlist: (itemId) => api.post('/orders/wishlist', { itemId }),
  removeFromWishlist: (itemId) => api.delete(`/orders/wishlist/${itemId}`),
  // Orders
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getReceivedOrders: () => api.get('/orders/received'),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  // Returns & Disputes
  requestReturn: (id, data) => api.post(`/orders/${id}/return`, data),
  fileDispute: (id, data) => api.post(`/orders/${id}/dispute`, data),
  // Admin
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
  getOrderDisputes: () => api.get('/orders/admin/disputes'),
  resolveOrderDispute: (id, data) => api.put(`/orders/admin/disputes/${id}`, data),
};

export default orderService;


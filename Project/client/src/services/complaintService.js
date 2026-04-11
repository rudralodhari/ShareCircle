import api from './api';

const complaintService = {
  createComplaint: (data) => api.post('/complaints', data),
  getComplaints: () => api.get('/complaints'),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
};

export default complaintService;

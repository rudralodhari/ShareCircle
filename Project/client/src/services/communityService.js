import api from './api';

const communityService = {
  getGroups: () => api.get('/community/groups'),
  joinGroup: (id) => api.post(`/community/groups/${id}/join`),
  postDiscussion: (groupId, data) => api.post(`/community/groups/${groupId}/discussions`, data),
  replyDiscussion: (discId, text) => api.post(`/community/discussions/${discId}/reply`, { text }),
  likeDiscussion: (discId) => api.post(`/community/discussions/${discId}/like`),
};

export default communityService;

import api from './api';

const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, message) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { message }),
  startConversation: (recipientId, itemId) =>
    api.post('/chat/conversations', { recipientId, itemId }),
  markAsRead: (conversationId) => api.put(`/chat/conversations/${conversationId}/read`),
};

export default chatService;

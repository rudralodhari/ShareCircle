import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import Sidebar from '../components/common/Sidebar';
import chatService from '../services/chatService';
import useAuth from '../hooks/useAuth';

export default function Chat() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Setup Socket.io
  useEffect(() => {
    const token = localStorage.getItem('sc-token');
    if (!token) return;
    
    // Check if in production or dev
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Fetch conversations from API
  useEffect(() => {
    const handleInitialConversations = (convosList) => {
      let finalConvos = [...convosList];
      let activeConvo = convosList[0] || null;
      
      if (location.state?.recipient && location.state?.item) {
        const { recipient, item } = location.state;
        const exists = finalConvos.find(c => c.participant?._id === recipient._id && c.item?._id === item._id);
        if (!exists) {
            const newConv = {
                _id: `temp_${Date.now()}`,
                participant: recipient,
                item: item,
                lastMessage: '',
                lastMessageAt: new Date(),
                unread: 0,
                isTemp: true
            };
            finalConvos = [newConv, ...finalConvos];
            activeConvo = newConv;
        } else {
            activeConvo = exists;
        }
      }
      
      setConversations(finalConvos);
      setActive(activeConvo);
    };

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await chatService.getConversations();
        const convos = res.data.conversations || [];
        handleInitialConversations(convos);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        handleInitialConversations([]);
      }
      setLoading(false);
    };

    if (isAuthenticated) {
      fetchConversations();
    } else {
      handleInitialConversations([]);
      setLoading(false);
    }
  }, [isAuthenticated, location.state]);

  // Handle Socket.io Join/Leave Conversation Rooms
  useEffect(() => {
    if (socket && active && !active.isTemp) {
      socket.emit('joinConversation', active._id);
      return () => {
        socket.emit('leaveConversation', active._id);
      };
    }
  }, [socket, active]);

  // Handle Receiving Real-Time Messages
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (data) => {
      // If it belongs to currently active viewed conversation, append it
      if (active && data.conversationId === active._id) {
        setMessages((prev) => [...prev, data.message]);
      }
      
      // Update the left sidebar latest message and unread count
      setConversations((prev) => {
        const exists = prev.find(c => c._id === data.conversationId);
        if (!exists) return prev; // If conversation isn't fetched yet, ignore
        return prev.map((c) => {
          if (c._id === data.conversationId) {
             return { 
               ...c, 
               lastMessage: data.message.text, 
               lastMessageAt: data.message.createdAt || new Date(), 
               unread: (active && active._id === c._id) ? 0 : (c.unread || 0) + 1 
             };
          }
          return c;
        }).sort((a,b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, active]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!active || active.isTemp) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await chatService.getMessages(active._id);
        setMessages(res.data.messages || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [active]);

  const handleSend = async (text) => {
    try {
      let activeId = active._id;
      
      // If it's a temporary conversation, creating the first message will create the real conversation on backend
      if (active.isTemp) {
        // We'll create the conversation by requesting one for this recipient and item
        const convRes = await chatService.startConversation(active.participant._id, active.item._id);
        if (convRes.data.conversation) {
          activeId = convRes.data.conversation._id;
          
          // Replace temp conversation in the list
          const realConv = convRes.data.conversation;
          setConversations(prev => prev.map(c => c._id === active._id ? realConv : c));
          setActive(realConv);
          
          // Join the newly created socket room
          if (socket) socket.emit('joinConversation', realConv._id);
        } else {
          throw new Error('Failed to create conversation');
        }
      }

      const res = await chatService.sendMessage(activeId, text);
      const newMsg = res.data.message;
      setMessages((prev) => [...prev, newMsg]);
      
      // Emit the message over Socket.io so the recipient receives it instantly
      if (socket) {
        socket.emit('sendMessage', { 
          conversationId: activeId, 
          message: newMsg,
          recipientId: active.participant._id
        });
      }
      
      // Update the last message in the conversation list
      setConversations((prev) => prev.map((c) => {
        if (c._id === activeId || c._id === active._id) {
          return { ...c, lastMessage: text, lastMessageAt: new Date() };
        }
        return c;
      }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optional: show a toast notification here
    }
  };

  const handleSelect = (conv) => {
    setActive(conv);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border" style={{ color: 'var(--primary-500)' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="chat-layout flex-grow-1">
        <div className="chat-sidebar">
          <ChatList conversations={conversations} activeId={active?._id} onSelect={handleSelect} />
        </div>
        <ChatWindow conversation={active} messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
}

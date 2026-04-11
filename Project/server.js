const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Database connection
const connectDB = require('./server/config/db');

// Route imports
const authRoutes = require('./server/routes/authRoutes');
const itemRoutes = require('./server/routes/itemRoutes');
const userRoutes = require('./server/routes/userRoutes');
const chatRoutes = require('./server/routes/chatRoutes');
const adminRoutes = require('./server/routes/adminRoutes');
const orderRoutes = require('./server/routes/orderRoutes');
const communityRoutes = require('./server/routes/communityRoutes');
const complaintRoutes = require('./server/routes/complaintRoutes');

// Middleware imports
const errorHandler = require('./server/middleware/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── Security Middleware ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting disabled per user request
// Stricter rate limit for auth routes disabled per user request

// ── CORS ──
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// ── Body Parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static Files ──
app.use('/images', express.static(path.join(__dirname, 'client', 'public', 'images')));

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/complaints', complaintRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler ──
app.use(errorHandler);

// ── Socket.io Setup ──
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: No token'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);

  // Join user to their own room (for direct notifications)
  socket.join(socket.userId);

  // Join a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(`chat:${conversationId}`);
    console.log(`User ${socket.userId} joined chat:${conversationId}`);
  });

  // Leave a conversation room
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`chat:${conversationId}`);
  });

  // Handle new message
  socket.on('sendMessage', (data) => {
    const { conversationId, message, recipientId } = data;
    // Broadcast to everyone in the conversation except sender
    socket.to(`chat:${conversationId}`).emit('newMessage', {
      conversationId,
      message: {
        ...message,
        isMine: false,
      },
    });

    if (recipientId) {
      socket.to(recipientId).emit('newNotification', {
        id: Date.now().toString(),
        text: `New message received`,
        time: 'Just now',
        read: false
      });
    }
  });

  // Typing indicators
  socket.on('typing', (data) => {
    socket.to(`chat:${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId: socket.userId,
    });
  });

  socket.on('stopTyping', (data) => {
    socket.to(`chat:${data.conversationId}`).emit('userStoppedTyping', {
      conversationId: data.conversationId,
      userId: socket.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.userId}`);
  });
});

// ── Start Server ──
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n🚀 ShareCircle server running on http://localhost:${PORT}`);
    console.log(`📦 API: http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io: Enabled`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
  });
};

startServer();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedules');
const menuRoutes = require('./routes/menus');
const busRoutes = require('./routes/buses');
const eventRoutes = require('./routes/events');
const updateRoutes = require('./routes/updates');
const faqRoutes = require('./routes/faqs');
const dashboardRoutes = require('./routes/dashboard');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for testing)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection
testConnection().then(() => {
  console.log('Database connection established');
}).catch(err => {
  console.error('Database connection failed:', err);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Student-specific routes (without /api prefix for frontend compatibility)
app.use('/schedules', scheduleRoutes);
app.use('/menus', menuRoutes);
app.use('/buses', busRoutes);
app.use('/events', eventRoutes);
app.use('/updates', updateRoutes);
app.use('/faqs', faqRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-chat', (sessionId) => {
    socket.join(sessionId);
    console.log(`Client ${socket.id} joined chat session: ${sessionId}`);
  });

  socket.on('user-typing', (sessionId) => {
    socket.to(sessionId).emit('typing');
  });

  socket.on('user-stop-typing', (sessionId) => {
    socket.to(sessionId).emit('stop-typing');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Campus Copilot API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Campus Copilot API - Novacore University',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Campus Copilot API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💬 Socket.IO enabled for real-time chat`);
});

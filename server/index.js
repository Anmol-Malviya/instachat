require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

// Config
const connectDB = require('./config/db');

// Services
const { initializeSocket } = require('./services/socketService');

// Routes
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const roomRoutes = require('./routes/roomRoutes');
const pushRoutes = require('./routes/pushRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const ALLOWED_ORIGINS = [
  'https://instachat-nu.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.ALLOWED_ORIGIN && process.env.ALLOWED_ORIGIN !== '*'
    ? [process.env.ALLOWED_ORIGIN]
    : []),
];

const app = express();
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Connect DB
connectDB();

// Health check
app.get('/', (req, res) => res.send('InstaChat Server ✅ (MongoDB MVC)'));

// Serve static uploads folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Socket & Server initialization
const server = http.createServer(app);
initializeSocket(server, ALLOWED_ORIGINS);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

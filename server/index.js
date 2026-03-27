require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { init: initSocket } = require('./config/socket');
const gpsLossWatcher = require('./services/gpsLossWatcher');

// Route handlers
const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes');
const busRoutes = require('./routes/buses');
const tripRoutes = require('./routes/trips');
const paymentRoutes = require('./routes/payment');
const incidentRoutes = require('./routes/incidents');
const gpsRoutes = require('./routes/gps');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const httpServer = http.createServer(app);

// Init Socket.io (must happen before routes that call getIO)
const io = initSocket(httpServer);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api', aiRoutes); // /api/routes/:id/risk

// Error handler
app.use(errorHandler);

// Socket.io room management
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join-trip', ({ tripId }) => {
    if (tripId) {
      socket.join(`trip:${tripId}`);
      console.log(`[Socket] ${socket.id} joined trip:${tripId}`);
    }
  });

  socket.on('join-operator', ({ operatorId }) => {
    if (operatorId) {
      socket.join(`operator:${operatorId}`);
      console.log(`[Socket] ${socket.id} joined operator:${operatorId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  gpsLossWatcher.start();
  httpServer.listen(PORT, () => {
    console.log(`SafeTrack server running on port ${PORT}`);
  });
});

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import net from 'net';
import connectDB from './config/database.js';
import { errorHandler, asyncHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/common.js';
import readerAuthRoutes from './routes/readerAuthRoutes.js';
import publisherAuthRoutes from './routes/publisherAuthRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import publisherBookRoutes from './routes/publisherBookRoutes.js';
import adminBookRoutes from './routes/adminBookRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminPurchaseRoutes from './routes/adminPurchaseRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import { startAutoActivationJob } from './utils/purchaseActivation.js';

// Load environment variables
dotenv.config();

const app = express();
let activePort = null;

const parseAllowedOrigins = () => {
  const configured = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(configured);
};

const allowedOrigins = parseAllowedOrigins();

const corsOriginValidator = (origin, callback) => {
  // Allow non-browser requests (no Origin header).
  if (!origin) {
    callback(null, true);
    return;
  }

  const isConfiguredOrigin = allowedOrigins.has(origin);
  const isLocalhostDevOrigin = /^http:\/\/localhost:\d+$/i.test(origin);
  const isLoopbackDevOrigin = /^http:\/\/127\.0\.0\.1:\d+$/i.test(origin);

  if (isConfiguredOrigin || isLocalhostDevOrigin || isLoopbackDevOrigin) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};

// Connect Database
connectDB();
startAutoActivationJob();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: corsOriginValidator,
  credentials: true,
}));
app.use(requestLogger);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    port: activePort,
    timestamp: new Date().toISOString(),
  });
});

// API Routes (Will be added as we create controllers)
app.use('/api/v1/auth/reader', readerAuthRoutes);
app.use('/api/v1/auth/publisher', publisherAuthRoutes);
app.use('/api/v1/auth/admin', adminAuthRoutes);
app.use('/api/v1/publisher/books', publisherBookRoutes);
app.use('/api/v1/admin/books', adminBookRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admin/purchases', adminPurchaseRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
// app.use('/api/v1/orders', orderRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/reviews', reviewRoutes);
// app.use('/api/v1/payments', paymentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler Middleware (Must be last)
app.use(errorHandler);

const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
};

const getStartPortCandidates = () => {
  const preferredPort = Number(process.env.PORT || 5000);
  const fallbackRange = Number(process.env.PORT_FALLBACK_RANGE || 10);

  return Array.from({ length: fallbackRange + 1 }, (_, index) => preferredPort + index);
};

const startServer = async () => {
  const candidatePorts = getStartPortCandidates();

  for (const port of candidatePorts) {
    // eslint-disable-next-line no-await-in-loop
    const available = await isPortAvailable(port);
    if (!available) continue;

    activePort = port;
    app.listen(port, () => {
      console.log(`✓ Server started on port ${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      if (String(port) !== String(process.env.PORT || 5000)) {
        console.log(`! Preferred port ${process.env.PORT || 5000} was busy, using ${port}`);
      }
    });
    return;
  }

  console.error('✗ No available port found for backend server startup.');
  process.exit(1);
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`✗ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

export default app;

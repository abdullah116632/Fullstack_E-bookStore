import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import { errorHandler, asyncHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/common.js';
import readerAuthRoutes from './routes/readerAuthRoutes.js';
import publisherAuthRoutes from './routes/publisherAuthRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(requestLogger);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (Will be added as we create controllers)
app.use('/api/v1/auth/reader', readerAuthRoutes);
app.use('/api/v1/auth/publisher', publisherAuthRoutes);
app.use('/api/v1/auth/admin', adminAuthRoutes);
// app.use('/api/v1/books', bookRoutes);
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server started on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`✗ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

export default app;

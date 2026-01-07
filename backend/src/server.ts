import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { setupSecurity } from './middleware/security';
import { apiLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './config/swagger';
import { initializeWebSocket } from './utils/websocket';
import { logger, stream } from './utils/logger';
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import userRoutes from './routes/user.routes';
import serviceRoutes from './routes/service.routes';
import inventoryRoutes from './routes/inventory.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import scheduleRoutes from './routes/schedule.routes';
import checkInRoutes from './routes/checkIn.routes';
import rosterRoutes from './routes/roster.routes';
import dashboardRoutes from './routes/dashboard.routes';
import webhookRoutes from './routes/webhook.routes';
import workflowRoutes from './routes/workflow.routes';
import integrationRoutes from './routes/integration.routes';
import appointmentRoutes from './routes/appointment.routes';
import calendarRoutes from './routes/calendar.routes';
import webhookEndpointRoutes from './routes/webhookEndpoint.routes';
import ingestRoutes from './routes/ingest.routes';
import leadRoutes from './routes/lead.routes';
import conversationRoutes from './routes/conversation.routes';
import aiRoutes from './routes/ai.routes';

// Import workers
import './workers/notification.worker';
import './workers/calendar.worker';
import './workers/webhook.worker';
import './workers/ai.worker';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3001;
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Initialize WebSocket
initializeWebSocket(server, allowedOrigins);

// Security middleware
setupSecurity(app);

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', { stream }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Documentation
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api/rosters', rosterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/webhook-endpoints', webhookEndpointRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  logger.info(`BTRIX Backend running on port ${PORT}`);
  logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer, allowedOrigins?: string[]): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error('JWT_SECRET not configured'));
      }

      const decoded = jwt.verify(token, secret) as {
        userId: string;
        companyId: string;
        role: string;
      };

      (socket as any).userId = decoded.userId;
      (socket as any).companyId = decoded.companyId;
      (socket as any).role = decoded.role;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const companyId = (socket as any).companyId;

    logger.info(`WebSocket client connected: ${userId} (company: ${companyId})`);

    // Join company room for broadcasts
    socket.join(`company:${companyId}`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${userId}`);
    });

    // Subscribe to order updates
    socket.on('subscribe:orders', () => {
      socket.join(`company:${companyId}:orders`);
      logger.info(`User ${userId} subscribed to order updates`);
    });

    // Subscribe to notifications
    socket.on('subscribe:notifications', () => {
      socket.join(`user:${userId}:notifications`);
      logger.info(`User ${userId} subscribed to notifications`);
    });
  });

  logger.info('✅ WebSocket server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
  }
  return io;
}

/**
 * Emit event to company room
 */
export function emitToCompany(companyId: string, event: string, data: any): void {
  if (io) {
    io.to(`company:${companyId}`).emit(event, data);
  }
}

/**
 * Emit event to user
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit order update
 */
export function emitOrderUpdate(companyId: string, order: any): void {
  emitToCompany(companyId, 'order:update', order);
  if (io) {
    io.to(`company:${companyId}:orders`).emit('order:update', order);
  }
}

/**
 * Emit notification
 */
export function emitNotification(userId: string, notification: any): void {
  emitToUser(userId, 'notification', notification);
  if (io) {
    io.to(`user:${userId}:notifications`).emit('notification', notification);
  }
}

export default {
  initializeWebSocket,
  getIO,
  emitToCompany,
  emitToUser,
  emitOrderUpdate,
  emitNotification,
};


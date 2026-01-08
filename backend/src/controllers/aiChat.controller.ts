import { NextFunction, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiChatService } from '../services/aiChat.service';
import { logger } from '../utils/logger';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000),
});

const payloadSchema = z.object({
  conversationId: z.string().optional(),
  messages: z.array(messageSchema).min(1).max(30),
  context: z
    .object({
      app: z.string().optional(),
      userId: z.string().optional(),
      tenantId: z.string().optional(),
    })
    .optional(),
});

export class AIChatController {
  async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId || (req.headers['x-tenant-id'] as string | undefined);
      if (!tenantId) {
        throw new AppError(401, 'Tenant not found');
      }

      const payloadSize = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
      if (payloadSize > 80 * 1024) {
        throw new AppError(413, 'Payload too large');
      }

      const parsed = payloadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, 'Invalid AI payload');
      }

      const start = Date.now();
      const result = await aiChatService.generateReply(tenantId, parsed.data);
      const latencyMs = Date.now() - start;

      logger.info('AI chat response', {
        tenantId,
        latencyMs,
        promptTokens: result.usage?.promptTokens || 0,
        completionTokens: result.usage?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0,
        messageCount: parsed.data.messages.length,
        model: result.model,
      });

      const conversationId = parsed.data.conversationId || crypto.randomUUID();
      const messageId = crypto.randomUUID();

      res.json({
        conversationId,
        message: {
          id: messageId,
          role: 'assistant',
          content: result.reply,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      return next(new AppError(502, 'AI provider error'));
    }
  }
}

export const aiChatController = new AIChatController();

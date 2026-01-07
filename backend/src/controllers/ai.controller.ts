import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

export class AIController {
  async classifyLead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const { leadId } = req.params;
      if (!leadId) throw new AppError(400, 'leadId is required');
      const result = await aiService.classifyLead(tenantId, leadId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async summarizeConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const { conversationId } = req.params;
      if (!conversationId) throw new AppError(400, 'conversationId is required');
      const { style, locale } = req.body || {};
      const result = await aiService.summarizeConversation(tenantId, conversationId, {
        style,
        locale,
        userId: req.userId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async draftReply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const { conversationId } = req.params;
      if (!conversationId) throw new AppError(400, 'conversationId is required');
      const { goal, tone, locale } = req.body || {};
      const result = await aiService.draftReply(tenantId, conversationId, {
        goal,
        tone,
        locale,
        userId: req.userId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();

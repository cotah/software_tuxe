import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { conversationService } from '../services/conversation.service';

export class ConversationController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const conversations = await conversationService.listConversations(tenantId, req.query);
      res.json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  }

  async listMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const messages = await conversationService.listMessages(tenantId, req.params.id);
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  async escalate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const conversation = await conversationService.escalateToHuman(tenantId, req.params.id);
      res.json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  }

  async close(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const conversation = await conversationService.closeConversation(tenantId, req.params.id);
      res.json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();


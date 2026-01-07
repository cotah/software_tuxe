import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

export class AISettingsController {
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const settings = await aiService.getSettings(tenantId);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const { enabled, dailyTokenLimit, defaultModel, allowSummarize, allowDraftReply } = req.body;
      const updated = await aiService.updateSettings(tenantId, {
        enabled,
        dailyTokenLimit,
        defaultModel,
        allowSummarize,
        allowDraftReply,
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const aiSettingsController = new AISettingsController();

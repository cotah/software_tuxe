import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { aiSettingsController } from '../controllers/aiSettings.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/leads/:leadId/classify', (req, res, next) => aiController.classifyLead(req as any, res, next));
router.post('/conversations/:conversationId/summarize', (req, res, next) =>
  aiController.summarizeConversation(req as any, res, next)
);
router.post('/conversations/:conversationId/draft-reply', (req, res, next) =>
  aiController.draftReply(req as any, res, next)
);

router.get('/settings', requireRole(UserRole.ADMIN), (req, res, next) =>
  aiSettingsController.getSettings(req as any, res, next)
);
router.patch('/settings', requireRole(UserRole.ADMIN), (req, res, next) =>
  aiSettingsController.updateSettings(req as any, res, next)
);

export default router;

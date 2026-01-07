import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => conversationController.list(req as any, res, next));
router.get('/:id/messages', (req, res, next) => conversationController.listMessages(req as any, res, next));
router.post('/:id/escalate', (req, res, next) => conversationController.escalate(req as any, res, next));
router.post('/:id/close', (req, res, next) => conversationController.close(req as any, res, next));

export default router;


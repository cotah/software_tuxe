import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import workflowController from '../controllers/workflow.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  (req, res, next) => workflowController.getWorkflows(req, res, next)
);

router.get(
  '/:id/transitions',
  authenticate,
  (req, res, next) => workflowController.getAvailableTransitions(req, res, next)
);

export default router;


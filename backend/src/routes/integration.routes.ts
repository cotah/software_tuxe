import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import integrationController from '../controllers/integration.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN),
  (req, res, next) => integrationController.getIntegrations(req, res, next)
);

router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN),
  (req, res, next) => integrationController.createIntegration(req, res, next)
);

router.post(
  '/:id/sync',
  authenticate,
  requireRole(UserRole.ADMIN),
  (req, res, next) => integrationController.syncIntegration(req, res, next)
);

export default router;


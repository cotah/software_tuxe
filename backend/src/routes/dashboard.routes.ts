import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const dashboardController = new DashboardController();

router.get('/admin', authenticate, requireRole(UserRole.ADMIN), (req, res, next) =>
  dashboardController.getAdminDashboard(req, res, next)
);

router.get('/staff', authenticate, requireRole(UserRole.STAFF, UserRole.ADMIN), (req, res, next) =>
  dashboardController.getStaffDashboard(req, res, next)
);

router.get('/kitchen', authenticate, requireRole(UserRole.KITCHEN, UserRole.ADMIN), (req, res, next) =>
  dashboardController.getKitchenDashboard(req, res, next)
);

export default router;



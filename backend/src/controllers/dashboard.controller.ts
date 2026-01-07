import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';

const dashboardService = new DashboardService();

export class DashboardController {
  async getAdminDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const data = await dashboardService.getAdminDashboard(companyId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStaffDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const userId = req.userId!;
      const data = await dashboardService.getStaffDashboard(companyId, userId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getKitchenDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const data = await dashboardService.getKitchenDashboard(companyId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}



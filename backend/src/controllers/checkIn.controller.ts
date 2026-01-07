import { Response, NextFunction } from 'express';
import { CheckInService } from '../services/checkIn.service';
import { AuthRequest } from '../middleware/auth.middleware';

const checkInService = new CheckInService();

export class CheckInController {
  async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const companyId = req.companyId!;
      const { notes } = req.body;
      const checkIn = await checkInService.checkIn(userId, companyId, notes);
      res.status(201).json({ success: true, data: checkIn });
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const companyId = req.companyId!;
      const { notes } = req.body;
      const checkIn = await checkInService.checkOut(userId, companyId, notes);
      res.json({ success: true, data: checkIn });
    } catch (error) {
      next(error);
    }
  }

  async getMyHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const companyId = req.companyId!;
      const { startDate, endDate } = req.query;
      const history = await checkInService.getHistory(userId, companyId, { startDate, endDate });
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getAllHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const { startDate, endDate, userId } = req.query;
      const history = await checkInService.getAllHistory(companyId, { startDate, endDate, userId });
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}



import { Response, NextFunction } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { AuthRequest } from '../middleware/auth.middleware';

const scheduleService = new ScheduleService();

export class ScheduleController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const { startDate, endDate, type, status } = req.query;
      const schedules = await scheduleService.getAll(companyId, { startDate, endDate, type, status });
      res.json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const schedule = await scheduleService.getById(id, companyId);
      res.json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const schedule = await scheduleService.create(companyId, req.body);
      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const schedule = await scheduleService.update(id, companyId, req.body);
      res.json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      await scheduleService.delete(id, companyId);
      res.json({ success: true, message: 'Schedule deleted' });
    } catch (error) {
      next(error);
    }
  }
}



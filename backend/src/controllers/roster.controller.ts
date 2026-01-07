import { Response, NextFunction } from 'express';
import { RosterService } from '../services/roster.service';
import { AuthRequest } from '../middleware/auth.middleware';

const rosterService = new RosterService();

export class RosterController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const { startDate, endDate, userId } = req.query;
      const rosters = await rosterService.getAll(companyId, { startDate, endDate, userId });
      res.json({ success: true, data: rosters });
    } catch (error) {
      next(error);
    }
  }

  async getMyRoster(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const companyId = req.companyId!;
      const { startDate, endDate } = req.query;
      const rosters = await rosterService.getMyRoster(userId, companyId, { startDate, endDate });
      res.json({ success: true, data: rosters });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const roster = await rosterService.create(companyId, req.body);
      res.status(201).json({ success: true, data: roster });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const roster = await rosterService.update(id, companyId, req.body);
      res.json({ success: true, data: roster });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      await rosterService.delete(id, companyId);
      res.json({ success: true, message: 'Roster deleted' });
    } catch (error) {
      next(error);
    }
  }
}



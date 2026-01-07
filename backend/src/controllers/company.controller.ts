import { Response, NextFunction } from 'express';
import { CompanyService } from '../services/company.service';
import { AuthRequest } from '../middleware/auth.middleware';

const companyService = new CompanyService();

export class CompanyController {
  async getMyCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const company = await companyService.getById(companyId);
      res.json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const company = await companyService.update(companyId, req.body);
      res.json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const settings = await companyService.getSettings(companyId);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const settings = await companyService.updateSettings(companyId, req.body);
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
}



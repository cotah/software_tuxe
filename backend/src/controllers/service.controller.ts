import { Response, NextFunction } from 'express';
import { ServiceService } from '../services/service.service';
import { AuthRequest } from '../middleware/auth.middleware';

const serviceService = new ServiceService();

export class ServiceController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const services = await serviceService.getAll(companyId);
      res.json({ success: true, data: services });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const service = await serviceService.getById(id, companyId);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const service = await serviceService.create(companyId, req.body);
      res.status(201).json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const service = await serviceService.update(id, companyId, req.body);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      await serviceService.delete(id, companyId);
      res.json({ success: true, message: 'Service deleted' });
    } catch (error) {
      next(error);
    }
  }
}



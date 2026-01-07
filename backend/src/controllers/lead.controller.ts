import { Response, NextFunction } from 'express';
import { LeadStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { leadService } from '../services/lead.service';
import { AppError } from '../middleware/errorHandler';

export class LeadController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const leads = await leadService.listLeads(tenantId, req.query);
      res.json({ success: true, data: leads });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const lead = await leadService.getLead(tenantId, req.params.id);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const lead = await leadService.updateLead(tenantId, req.params.id, req.body);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const { status, reason } = req.body;
      if (!status) {
        throw new AppError(400, 'Status is required');
      }
      const lead = await leadService.changeStatus({
        tenantId,
        leadId: req.params.id,
        toStatus: status as LeadStatus,
        reason,
        changedByUserId: req.userId,
      });
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }
}

export const leadController = new LeadController();


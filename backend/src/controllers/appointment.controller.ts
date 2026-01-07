import { Response, NextFunction } from 'express';
import { AppointmentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { appointmentService } from '../services/appointment.service';
import { icsService } from '../services/ics.service';
import { AppError } from '../middleware/errorHandler';

export class AppointmentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const userId = req.userId!;
      const appointment = await appointmentService.createAppointment(tenantId, req.body, userId);
      res.status(201).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const { from, to, status, assignedUserId, customerId } = req.query;

      const appointments = await appointmentService.listAppointments(tenantId, {
        from: from as string,
        to: to as string,
        status: status as AppointmentStatus,
        assignedUserId: assignedUserId as string,
        customerId: customerId as string,
      });

      res.json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const appointment = await appointmentService.getById(req.params.id, tenantId);
      res.json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const appointment = await appointmentService.updateAppointment(
        req.params.id,
        tenantId,
        req.body,
        req.userId!
      );
      res.json({ success: true, data: appointment });
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
      const updated = await appointmentService.changeStatus(
        req.params.id,
        tenantId,
        status as AppointmentStatus,
        reason,
        req.userId!
      );

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async downloadICS(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const appointment = await appointmentService.getById(req.params.id, tenantId);
      const ics = icsService.generateICS(appointment);

      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename="appointment-${appointment.id}.ics"`);
      res.send(ics);
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();


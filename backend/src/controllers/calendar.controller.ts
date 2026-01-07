import { Response, NextFunction } from 'express';
import { CalendarProvider } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { calendarService } from '../services/calendar.service';
import { calendarQueue } from '../utils/queue';

function parseProvider(providerParam: string): CalendarProvider {
  const normalized = providerParam.toUpperCase() as CalendarProvider;
  if (!['GOOGLE', 'MICROSOFT', 'CALENDLY'].includes(normalized)) {
    throw new AppError(400, 'Unsupported provider');
  }
  return normalized;
}

export class CalendarController {
  async listProviders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const providers = await calendarService.listConnections(tenantId);
      res.json({ success: true, data: providers });
    } catch (error) {
      next(error);
    }
  }

  async connect(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const provider = parseProvider(req.params.provider);
      const tenantId = req.companyId!;
      const authUrl = await calendarService.getAuthUrl(provider, tenantId);
      res.json({ success: true, data: { authUrl } });
    } catch (error) {
      next(error);
    }
  }

  async callback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const provider = parseProvider(req.params.provider);
      const tenantId = req.companyId!;
      const code = req.query.code as string;
      if (!code) {
        throw new AppError(400, 'Authorization code is required');
      }

      const connection = await calendarService.handleCallback(provider, tenantId, code);
      res.json({ success: true, data: connection });
    } catch (error) {
      next(error);
    }
  }

  async disconnect(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const provider = parseProvider(req.params.provider);
      const tenantId = req.companyId!;
      await calendarService.disconnect(provider, tenantId);
      res.json({ success: true, message: 'Disconnected' });
    } catch (error) {
      next(error);
    }
  }

  async pushSync(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const provider = parseProvider(req.params.provider);
      const tenantId = req.companyId!;
      const appointmentId = req.params.appointmentId;

      await calendarQueue.add('calendar.sync.push', {
        tenantId,
        provider,
        appointmentId,
      });

      res.json({ success: true, message: 'Push sync scheduled' });
    } catch (error) {
      next(error);
    }
  }

  async pullSync(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const provider = parseProvider(req.params.provider);
      const tenantId = req.companyId!;
      const { from, to, safe } = req.query;

      await calendarQueue.add('calendar.sync.pull', {
        tenantId,
        provider,
        from,
        to,
        safeMode: safe === 'true',
      });

      res.json({ success: true, message: 'Pull sync scheduled' });
    } catch (error) {
      next(error);
    }
  }
}

export const calendarController = new CalendarController();


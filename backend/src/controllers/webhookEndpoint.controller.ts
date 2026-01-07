import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { webhookService } from '../services/webhook.service';

export class WebhookEndpointController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const endpoints = await prisma.webhookEndpoint.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          url: true,
          isEnabled: true,
          eventTypes: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.json({ success: true, data: endpoints });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.companyId!;
      const { name, url, secret, eventTypes } = req.body;
      if (!name || !url || !secret || !Array.isArray(eventTypes)) {
        throw new AppError(400, 'name, url, secret, and eventTypes are required');
      }
      const endpoint = await webhookService.createEndpoint({
        tenantId,
        name,
        url,
        secret,
        eventTypes,
        isEnabled: true,
      });
      res.status(201).json({
        success: true,
        data: {
          id: endpoint.id,
          name: endpoint.name,
          url: endpoint.url,
          eventTypes: endpoint.eventTypes,
          isEnabled: endpoint.isEnabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const webhookEndpointController = new WebhookEndpointController();


import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import integrationService from '../services/integration.service';
import { AppError } from '../middleware/errorHandler';
import { IntegrationType } from '@prisma/client';
import prisma from '../utils/prisma';

export class IntegrationController {
  async getIntegrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;

      const integrations = await prisma.integration.findMany({
        where: { companyId },
        select: {
          id: true,
          type: true,
          name: true,
          isActive: true,
          lastSyncAt: true,
          syncStatus: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
          // Don't expose config
        },
      });

      res.json({
        success: true,
        data: integrations,
      });
    } catch (error) {
      next(error);
    }
  }

  async createIntegration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const { type, name, config, webhookUrl } = req.body;

      if (!type || !name || !config) {
        throw new AppError(400, 'Type, name, and config are required');
      }

      const integration = await integrationService.upsertIntegration(
        companyId,
        type as IntegrationType,
        name,
        config,
        webhookUrl
      );

      res.status(201).json({
        success: true,
        data: {
          id: integration.id,
          type: integration.type,
          name: integration.name,
          isActive: integration.isActive,
          // Don't expose config
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async syncIntegration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action, data } = req.body;

      if (!action) {
        throw new AppError(400, 'Action is required');
      }

      const result = await integrationService.syncIntegration(id, action, data);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new IntegrationController();


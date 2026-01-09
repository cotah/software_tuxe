import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import integrationService from '../services/integration.service';
import { AppError } from '../middleware/errorHandler';
import { IntegrationType } from '@prisma/client';
import prisma from '../utils/prisma';

const dataProviders: Record<string, { type: IntegrationType; name: string }> = {
  google_sheets: { type: IntegrationType.GOOGLE_SHEETS, name: 'Google Sheets' },
  microsoft_excel: { type: IntegrationType.MICROSOFT_EXCEL, name: 'Microsoft Excel' },
  csv: { type: IntegrationType.CSV, name: 'CSV Upload' },
};

function mapIntegrationStatus(integration: {
  isActive: boolean;
  syncStatus: string | null;
}): 'connected' | 'disconnected' | 'error' {
  if (!integration.isActive) return 'disconnected';
  if (integration.syncStatus === 'error') return 'error';
  return 'connected';
}

function providerFromType(type: IntegrationType): string {
  const entry = Object.entries(dataProviders).find(([, value]) => value.type === type);
  return entry ? entry[0] : String(type).toLowerCase();
}

function normalizeIntegration(integration: {
  id: string;
  type: IntegrationType;
  isActive: boolean;
  lastSyncAt: Date | null;
  syncStatus: string | null;
  errorMessage: string | null;
  updatedAt: Date;
}) {
  return {
    id: integration.id,
    provider: providerFromType(integration.type),
    status: mapIntegrationStatus(integration),
    connectedAt: integration.isActive ? integration.updatedAt.toISOString() : null,
    lastSyncAt: integration.lastSyncAt ? integration.lastSyncAt.toISOString() : null,
    errorMessage: integration.errorMessage || null,
  };
}

export class IntegrationController {
  async getIntegrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;

      const providerTypes = Object.values(dataProviders).map((item) => item.type);
      const integrations = await prisma.integration.findMany({
        where: { companyId, type: { in: providerTypes } },
        select: {
          id: true,
          type: true,
          isActive: true,
          lastSyncAt: true,
          syncStatus: true,
          errorMessage: true,
          updatedAt: true,
        },
      });

      return res.json({
        success: true,
        data: integrations.map(normalizeIntegration),
      });
    } catch (error) {
      return next(error);
    }
  }

  async connectIntegration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const provider = req.params.provider?.toLowerCase();
      const config = dataProviders[provider];
      if (!config) {
        throw new AppError(400, 'Provider not supported');
      }

      const existing = await prisma.integration.findFirst({
        where: { companyId, type: config.type },
      });

      const integration = existing
        ? await prisma.integration.update({
            where: { id: existing.id },
            data: {
              name: config.name,
              isActive: true,
              syncStatus: 'connected',
              errorMessage: null,
              config: { provider },
            },
          })
        : await prisma.integration.create({
            data: {
              companyId,
              type: config.type,
              name: config.name,
              config: { provider },
              isActive: true,
              syncStatus: 'connected',
            },
          });

      return res.json({
        success: true,
        authUrl: `https://example.com/oauth/${provider}`,
        data: normalizeIntegration(integration),
      });
    } catch (error) {
      return next(error);
    }
  }

  async disconnectIntegration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const provider = req.params.provider?.toLowerCase();
      const config = dataProviders[provider];
      if (!config) {
        throw new AppError(400, 'Provider not supported');
      }

      const existing = await prisma.integration.findFirst({
        where: { companyId, type: config.type },
      });

      if (!existing) {
        return res.json({
          success: true,
          data: {
            provider,
            status: 'disconnected',
          },
        });
      }

      const integration = await prisma.integration.update({
        where: { id: existing.id },
        data: {
          isActive: false,
          syncStatus: 'disconnected',
          errorMessage: null,
        },
      });

      return res.json({ success: true, data: normalizeIntegration(integration) });
    } catch (error) {
      return next(error);
    }
  }

  async syncProvider(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const provider = req.params.provider?.toLowerCase();
      const config = dataProviders[provider];
      if (!config) {
        throw new AppError(400, 'Provider not supported');
      }

      const existing = await prisma.integration.findFirst({
        where: { companyId, type: config.type },
      });

      if (!existing || !existing.isActive) {
        throw new AppError(400, 'Integration not connected');
      }

      const integration = await prisma.integration.update({
        where: { id: existing.id },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'connected',
          errorMessage: null,
        },
      });

      return res.json({ success: true, data: normalizeIntegration(integration) });
    } catch (error) {
      return next(error);
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
      return next(error);
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
      return next(error);
    }
  }
}

export default new IntegrationController();


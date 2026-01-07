import prisma from '../utils/prisma';
import { IntegrationType } from '@prisma/client';
import { logger } from '../utils/logger';
import { encrypt, decrypt } from '../utils/encryption';
import { AppError } from '../middleware/errorHandler';

export interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookSecret?: string;
  baseUrl?: string;
  [key: string]: any;
}

export class IntegrationService {
  /**
   * Create or update integration
   */
  async upsertIntegration(
    companyId: string,
    type: IntegrationType,
    name: string,
    config: IntegrationConfig,
    webhookUrl?: string
  ) {
    // Encrypt sensitive config data
    const encryptedConfig = this.encryptConfig(config);

    const existing = await prisma.integration.findFirst({
      where: {
        companyId,
        type,
      },
    });

    if (existing) {
      return prisma.integration.update({
        where: { id: existing.id },
        data: {
          name,
          config: encryptedConfig as any,
          webhookUrl,
          isActive: true,
        },
      });
    }

    return prisma.integration.create({
      data: {
        companyId,
        type,
        name,
        config: encryptedConfig as any,
        webhookUrl,
        isActive: true,
      },
    });
  }

  /**
   * Get integration config (decrypted)
   */
  async getIntegrationConfig(integrationId: string): Promise<IntegrationConfig> {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new AppError(404, 'Integration not found');
    }

    return this.decryptConfig(integration.config as any);
  }

  /**
   * Encrypt sensitive config fields
   */
  private encryptConfig(config: IntegrationConfig): any {
    const encrypted: any = { ...config };
    const sensitiveFields = ['apiKey', 'apiSecret', 'accessToken', 'refreshToken', 'webhookSecret', 'password'];

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = encrypt(encrypted[field]);
      }
    }

    return encrypted;
  }

  /**
   * Decrypt config fields
   */
  private decryptConfig(config: any): IntegrationConfig {
    const decrypted: any = { ...config };
    const sensitiveFields = ['apiKey', 'apiSecret', 'accessToken', 'refreshToken', 'webhookSecret', 'password'];

    for (const field of sensitiveFields) {
      if (decrypted[field]) {
        try {
          decrypted[field] = decrypt(decrypted[field]);
        } catch (error) {
          logger.warn(`Failed to decrypt field ${field}: ${error}`);
        }
      }
    }

    return decrypted;
  }

  /**
   * Sync with external system (generic)
   */
  async syncIntegration(integrationId: string, action: string, data?: any) {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || !integration.isActive) {
      throw new AppError(404, 'Integration not found or inactive');
    }

    const config = await this.getIntegrationConfig(integrationId);
    const startTime = Date.now();

    try {
      let result: any;

      switch (integration.type) {
        case 'BITRIX24':
          result = await this.syncBitrix24(integration, config, action, data);
          break;
        case 'IFOOD':
        case 'RAPPI':
          result = await this.syncDeliveryPlatform(integration, config, action, data);
          break;
        case 'BLING':
        case 'TINY_ERP':
          result = await this.syncERP(integration, config, action, data);
          break;
        default:
          throw new AppError(400, `Sync not implemented for ${integration.type}`);
      }

      const duration = Date.now() - startTime;

      // Log successful sync
      await prisma.integrationSyncLog.create({
        data: {
          integrationId,
          action,
          status: 'success',
          entityType: data?.entityType,
          entityId: data?.entityId,
          requestData: data as any,
          responseData: result as any,
          duration,
        },
      });

      await prisma.integration.update({
        where: { id: integrationId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'success',
          errorMessage: null,
        },
      });

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Log failed sync
      await prisma.integrationSyncLog.create({
        data: {
          integrationId,
          action,
          status: 'error',
          entityType: data?.entityType,
          entityId: data?.entityId,
          requestData: data as any,
          errorMessage: error.message,
          duration,
        },
      });

      await prisma.integration.update({
        where: { id: integrationId },
        data: {
          syncStatus: 'error',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Bitrix24 integration
   */
  private async syncBitrix24(
    integration: any,
    config: IntegrationConfig,
    action: string,
    data?: any
  ): Promise<any> {
    // TODO: Implement Bitrix24 API calls
    logger.info(`Bitrix24 sync: ${action}`, { data });
    return { success: true, message: 'Bitrix24 sync not yet fully implemented' };
  }

  /**
   * Delivery platform integration (iFood, Rappi)
   */
  private async syncDeliveryPlatform(
    integration: any,
    config: IntegrationConfig,
    action: string,
    data?: any
  ): Promise<any> {
    // TODO: Implement delivery platform API calls
    logger.info(`${integration.type} sync: ${action}`, { data });
    return { success: true, message: `${integration.type} sync not yet fully implemented` };
  }

  /**
   * ERP integration (Bling, Tiny ERP)
   */
  private async syncERP(
    integration: any,
    config: IntegrationConfig,
    action: string,
    data?: any
  ): Promise<any> {
    // TODO: Implement ERP API calls
    logger.info(`${integration.type} sync: ${action}`, { data });
    return { success: true, message: `${integration.type} sync not yet fully implemented` };
  }

  /**
   * Handle incoming webhook from external system
   */
  async handleWebhook(integrationId: string, payload: any, signature?: string): Promise<void> {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new AppError(404, 'Integration not found');
    }

    // Verify webhook signature if provided
    if (signature && integration.webhookUrl) {
      // TODO: Implement signature verification
      logger.warn('Webhook signature verification not yet implemented');
    }

    // Process webhook based on integration type
    logger.info(`Received webhook for integration ${integrationId}`, { payload });

    // Store webhook event for processing
    // TODO: Queue webhook processing
  }
}

export default new IntegrationService();


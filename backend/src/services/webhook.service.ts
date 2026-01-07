import crypto from 'crypto';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { encrypt, decrypt } from '../utils/encryption';
import { webhookQueue } from '../utils/queue';
import { logger } from '../utils/logger';

export class WebhookService {
  async handleBtrixWebhook(data: any) {
    logger.info('BTRIX Webhook received', { data });
    const { event } = data;
    return {
      received: true,
      event,
      processed: true,
    };
  }

  async createEvent(data: any) {
    return {
      eventId: `evt_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
  }

  async createEndpoint(params: {
    tenantId: string;
    name: string;
    url: string;
    secret: string;
    eventTypes: string[];
    isEnabled?: boolean;
  }) {
    const { tenantId, name, url, secret, eventTypes, isEnabled } = params;
    return prisma.webhookEndpoint.create({
      data: {
        tenantId,
        name,
        url,
        secretEncrypted: encrypt(secret),
        eventTypes,
        isEnabled: isEnabled ?? true,
      },
    });
  }

  computeSignature(secret: string, rawBody: string) {
    return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  }

  async enqueueEvent(tenantId: string, eventType: string, payload: any) {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        tenantId,
        isEnabled: true,
        eventTypes: { has: eventType },
      },
    });

    if (!endpoints.length) {
      return;
    }

    for (const endpoint of endpoints) {
      const delivery = await prisma.webhookDelivery.create({
        data: {
          tenantId,
          endpointId: endpoint.id,
          eventType,
          payload,
          status: 'PENDING',
          attempts: 0,
        },
      });

      await webhookQueue.add('webhook.deliver', {
        deliveryId: delivery.id,
      });
    }
  }

  async deliverWebhook(deliveryId: string) {
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { endpoint: true },
    });

    if (!delivery) {
      throw new AppError(404, 'Webhook delivery not found');
    }

    const secret = decrypt(delivery.endpoint.secretEncrypted);
    const body = JSON.stringify(delivery.payload);
    const signature = this.computeSignature(secret, body);

    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: { attempts: delivery.attempts + 1 },
    });

    const response = await fetch(delivery.endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Event': delivery.eventType,
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'FAILED',
          lastError: `HTTP ${response.status}: ${text}`,
        },
      });
      throw new Error(`Webhook delivery failed: ${response.status}`);
    }

    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'SENT',
        lastError: null,
      },
    });
  }
}

export const webhookService = new WebhookService();


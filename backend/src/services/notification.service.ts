import prisma from '../utils/prisma';
import { notificationQueue } from '../utils/queue';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const isEmailConfigured =
  Boolean(process.env.SMTP_HOST) &&
  Boolean(process.env.SMTP_USER) &&
  Boolean(process.env.SMTP_PASSWORD);
const isTwilioConfigured =
  Boolean(process.env.TWILIO_ACCOUNT_SID) &&
  Boolean(process.env.TWILIO_AUTH_TOKEN);
const isDev = process.env.NODE_ENV !== 'production';

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// WhatsApp/Twilio configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export interface NotificationData {
  companyId: string;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  message: string;
  template?: string;
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Queue a notification for processing
   */
  async queueNotification(data: NotificationData): Promise<string> {
    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        companyId: data.companyId,
        channel: data.channel,
        recipient: data.recipient,
        subject: data.subject,
        message: data.message,
        template: data.template,
        templateData: data.templateData as any,
        metadata: data.metadata as any,
        status: NotificationStatus.PENDING,
      },
    });

    // Add to queue
    await notificationQueue.add('send-notification', {
      notificationId: notification.id,
      ...data,
    });

    logger.info(`Queued notification ${notification.id} via ${data.channel}`);
    return notification.id;
  }

  /**
   * Send notification (called by queue worker)
   */
  async sendNotification(notificationId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    if (notification.status !== 'PENDING') {
      logger.warn(`Notification ${notificationId} already processed`);
      return;
    }

    try {
      if (notification.channel === NotificationChannel.EMAIL && !isEmailConfigured) {
        if (isDev) {
          await this.markSkipped(notificationId, 'SMTP not configured; using dev mock');
          return;
        }
        throw new Error('SMTP not configured');
      }

      if (
        (notification.channel === NotificationChannel.WHATSAPP ||
          notification.channel === NotificationChannel.SMS) &&
        (!isTwilioConfigured ||
          (notification.channel === NotificationChannel.WHATSAPP && !process.env.TWILIO_WHATSAPP_FROM) ||
          (notification.channel === NotificationChannel.SMS && !process.env.TWILIO_PHONE_FROM))
      ) {
        if (isDev) {
          await this.markSkipped(notificationId, 'Twilio not configured; using dev mock');
          return;
        }
        throw new Error('Twilio not configured');
      }

      if (notification.channel === NotificationChannel.PUSH) {
        await this.markSkipped(notificationId, 'Push notifications not implemented');
        return;
      }

      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmail(notification);
          break;
        case NotificationChannel.WHATSAPP:
          await this.sendWhatsApp(notification);
          break;
        case NotificationChannel.SMS:
          await this.sendSMS(notification);
          break;
        default:
          throw new Error(`Unsupported channel: ${notification.channel}`);
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      logger.info(`Notification ${notificationId} sent successfully`);
    } catch (error: any) {
      const retryCount = notification.retryCount + 1;
      const isConfigError = (error.message || '').toLowerCase().includes('not configured');
      const shouldRetry = !isConfigError && retryCount < notification.maxRetries;

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: shouldRetry ? NotificationStatus.PENDING : NotificationStatus.FAILED,
          retryCount,
          errorMessage: error.message,
          failedAt: shouldRetry ? null : new Date(),
        },
      });

      if (shouldRetry) {
        // Re-queue for retry
        await notificationQueue.add(
          'send-notification',
          {
            notificationId,
            companyId: notification.companyId,
            channel: notification.channel,
            recipient: notification.recipient,
            subject: notification.subject || undefined,
            message: notification.message,
          },
          {
            delay: Math.pow(2, retryCount) * 1000, // Exponential backoff
          }
        );
      }

      logger.error(`Failed to send notification ${notificationId}: ${error.message}`);
      throw error;
    }
  }

  private async markSkipped(notificationId: string, reason: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.SKIPPED,
        errorMessage: reason,
        failedAt: new Date(),
      },
    });
    logger.warn(`Notification ${notificationId} skipped: ${reason}`);
  }

  private async sendEmail(notification: any): Promise<void> {
    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP not configured');
    }

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@btrix.com',
      to: notification.recipient,
      subject: notification.subject || 'Notification',
      text: notification.message,
      html: this.formatMessageAsHTML(notification.message),
    });
  }

  private async sendWhatsApp(notification: any): Promise<void> {
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_FROM) {
      throw new Error('Twilio WhatsApp not configured');
    }

    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${notification.recipient}`,
      body: notification.message,
    });
  }

  private async sendSMS(notification: any): Promise<void> {
    if (!twilioClient || !process.env.TWILIO_PHONE_FROM) {
      throw new Error('Twilio SMS not configured');
    }

    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_FROM,
      to: notification.recipient,
      body: notification.message,
    });
  }

  private async sendPush(notification: any): Promise<void> {
    // TODO: Implement push notifications (FCM, OneSignal, etc.)
    logger.warn('Push notifications not yet implemented');
    throw new Error('Push notifications not yet implemented');
  }

  private formatMessageAsHTML(message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get notification statistics
   */
  async getStats(companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = { companyId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, sent, failed, pending] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, status: 'SENT' } }),
      prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
      prisma.notification.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? (sent / total) * 100 : 0,
    };
  }
}

export default new NotificationService();


import { Worker } from 'bullmq';
import notificationService from '../services/notification.service';
import { logger } from '../utils/logger';
import { queueConnection } from '../utils/queue';

const worker = new Worker(
  'notifications',
  async (job) => {
    const { notificationId } = job.data;
    logger.info(`Processing notification job ${job.id} for notification ${notificationId}`);
    await notificationService.sendNotification(notificationId);
  },
  {
    connection: queueConnection,
    concurrency: 5, // Process 5 notifications concurrently
  }
);

worker.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Notification job ${job?.id} failed: ${err.message}`);
});

worker.on('error', (err) => {
  logger.error(`Notification worker error: ${err.message}`);
});

logger.info('✅ Notification worker started');

export default worker;


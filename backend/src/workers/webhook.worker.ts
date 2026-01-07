import { Worker } from 'bullmq';
import { webhookService } from '../services/webhook.service';
import { logger } from '../utils/logger';
import { queueConnection, QUEUE_NAMES } from '../utils/queue';

const worker = new Worker(
  QUEUE_NAMES.WEBHOOKS,
  async (job) => {
    logger.info(`Processing webhook job ${job.name}`, { jobId: job.id });
    switch (job.name) {
      case 'webhook.deliver': {
        const { deliveryId } = job.data;
        await webhookService.deliverWebhook(deliveryId);
        return;
      }
      default:
        throw new Error(`Unknown webhook job: ${job.name}`);
    }
  },
  {
    connection: queueConnection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  logger.info(`Webhook job ${job.id} (${job.name}) completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Webhook job ${job?.id} (${job?.name}) failed: ${err.message}`);
});

worker.on('error', (err) => {
  logger.error(`Webhook worker error: ${err.message}`);
});

logger.info('Webhook worker started');

export default worker;


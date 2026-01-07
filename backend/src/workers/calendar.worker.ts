import { Worker } from 'bullmq';
import { calendarService } from '../services/calendar.service';
import { logger } from '../utils/logger';
import { queueConnection, QUEUE_NAMES, calendarQueue } from '../utils/queue';

const worker = new Worker(
  QUEUE_NAMES.CALENDAR,
  async (job) => {
    logger.info(`Processing calendar job ${job.name}`, { id: job.id, data: job.data });

    switch (job.name) {
      case 'calendar.sync.push': {
        const { appointmentId, provider, tenantId } = job.data;
        await calendarService.pushAppointment(appointmentId, provider, tenantId);
        return;
      }
      case 'calendar.sync.pull': {
        const { tenantId, provider, from, to, safeMode } = job.data;
        await calendarService.pullEvents({ tenantId, provider, from, to, safeMode });
        return;
      }
      case 'calendar.webhook.process': {
        const { provider, payload, headers } = job.data;
        const result = await calendarService.processWebhookEvent(provider, payload, headers);
        const tenants = result?.tenantIds || [];

        for (const tenantId of tenants) {
          await calendarQueue.add('calendar.sync.pull', {
            tenantId,
            provider,
            from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            safeMode: true,
          });
        }
        return;
      }
      case 'calendar.subscription.renew': {
        const { tenantId, provider } = job.data;
        await calendarService.renewSubscription(tenantId, provider);
        return;
      }
      default:
        throw new Error(`Unknown calendar job: ${job.name}`);
    }
  },
  {
    connection: queueConnection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  logger.info(`Calendar job ${job.id} (${job.name}) completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Calendar job ${job?.id} (${job?.name}) failed: ${err.message}`);
});

worker.on('error', (err) => {
  logger.error(`Calendar worker error: ${err.message}`);
});

logger.info('Calendar worker started');

export default worker;


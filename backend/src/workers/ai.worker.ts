import { Worker } from 'bullmq';
import { aiService } from '../services/ai.service';
import { logger } from '../utils/logger';
import { queueConnection, QUEUE_NAMES } from '../utils/queue';

const worker = new Worker(
  QUEUE_NAMES.AI,
  async (job) => {
    logger.info(`Processing AI job ${job.name}`, { jobId: job.id, tenantId: job.data?.tenantId });
    const { tenantId } = job.data;
    switch (job.name) {
      case 'ai.classifyLead':
        await aiService.classifyLead(tenantId, job.data.leadId);
        return;
      case 'ai.summarizeConversation':
        await aiService.summarizeConversation(tenantId, job.data.conversationId);
        return;
      case 'ai.draftReply':
        await aiService.draftReply(tenantId, job.data.conversationId);
        return;
      default:
        throw new Error(`Unknown AI job: ${job.name}`);
    }
  },
  { connection: queueConnection, concurrency: 3 }
);

worker.on('completed', (job) => {
  logger.info(`AI job ${job.id} (${job.name}) completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`AI job ${job?.id} (${job?.name}) failed: ${err.message}`);
});

worker.on('error', (err) => {
  logger.error(`AI worker error: ${err.message}`);
});

logger.info('AI worker started');

export default worker;


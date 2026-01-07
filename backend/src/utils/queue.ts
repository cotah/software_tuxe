import dotenv from 'dotenv';
import { Queue, QueueEvents, ConnectionOptions } from 'bullmq';
import { logger } from './logger';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const queueConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Queue names
export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  WEBHOOKS: 'webhooks',
  INTEGRATIONS: 'integrations',
  CALENDAR: 'calendar',
  AUDIT: 'audit',
  AI: 'ai',
} as const;

// Create queues
const stubQueue = { add: async () => {} } as any;
const stubEvents = { on: () => {} } as any;

const queueOptions = (attempts: number, delay: number) => ({
  connection: queueConnection,
  defaultJobOptions: {
    attempts,
    backoff: { type: 'exponential', delay },
  },
});

export const notificationQueue = isTest
  ? stubQueue
  : new Queue(QUEUE_NAMES.NOTIFICATIONS, {
      connection: queueConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000,
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    });

export const webhookQueue = isTest ? stubQueue : new Queue(QUEUE_NAMES.WEBHOOKS, queueOptions(3, 2000));
export const integrationQueue = isTest ? stubQueue : new Queue(QUEUE_NAMES.INTEGRATIONS, queueOptions(2, 5000));
export const calendarQueue = isTest
  ? stubQueue
  : new Queue(QUEUE_NAMES.CALENDAR, {
      connection: queueConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnFail: {
          age: 86400,
        },
      },
    });
export const aiQueue = isTest ? stubQueue : new Queue(QUEUE_NAMES.AI, queueOptions(2, 4000));

// Queue events for monitoring
export const notificationQueueEvents = isTest
  ? (stubEvents as QueueEvents)
  : new QueueEvents(QUEUE_NAMES.NOTIFICATIONS, { connection: queueConnection });

export const webhookQueueEvents = isTest
  ? (stubEvents as QueueEvents)
  : new QueueEvents(QUEUE_NAMES.WEBHOOKS, { connection: queueConnection });

export const calendarQueueEvents = isTest
  ? (stubEvents as QueueEvents)
  : new QueueEvents(QUEUE_NAMES.CALENDAR, { connection: queueConnection });

export const aiQueueEvents = isTest
  ? (stubEvents as QueueEvents)
  : new QueueEvents(QUEUE_NAMES.AI, { connection: queueConnection });

// Log queue events
if (!isTest) {
  notificationQueueEvents.on('completed', ({ jobId }) => {
    logger.info(`Notification job ${jobId} completed`);
  });

  notificationQueueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.error(`Notification job ${jobId} failed: ${failedReason}`);
  });

  webhookQueueEvents.on('completed', ({ jobId }) => {
    logger.info(`Webhook job ${jobId} completed`);
  });

  webhookQueueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.error(`Webhook job ${jobId} failed: ${failedReason}`);
  });

  calendarQueueEvents.on('completed', ({ jobId }) => {
    logger.info(`Calendar job ${jobId} completed`);
  });

  calendarQueueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.error(`Calendar job ${jobId} failed: ${failedReason}`);
  });

  aiQueueEvents.on('completed', ({ jobId }) => {
    logger.info(`AI job ${jobId} completed`);
  });

  aiQueueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.error(`AI job ${jobId} failed: ${failedReason}`);
  });
}

export default {
  notificationQueue,
  webhookQueue,
  integrationQueue,
  calendarQueue,
  aiQueue,
};


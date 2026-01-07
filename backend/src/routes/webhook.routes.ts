import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { calendarWebhookController } from '../controllers/calendarWebhook.controller';

const router = Router();
const webhookController = new WebhookController();

// Public webhook endpoints for BTRIX automations
router.post('/btrix', (req, res, next) => webhookController.handleBtrixWebhook(req, res, next));
router.post('/events', (req, res, next) => webhookController.createEvent(req, res, next));
router.post('/google/calendar', (req, res, next) => calendarWebhookController.handleGoogle(req, res, next));
router.post('/microsoft/calendar', (req, res, next) => calendarWebhookController.handleMicrosoft(req, res, next));

export default router;



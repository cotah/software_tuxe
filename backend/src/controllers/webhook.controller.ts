import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/webhook.service';

const webhookService = new WebhookService();

export class WebhookController {
  async handleBtrixWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // Handle webhook from BTRIX automations
      const result = await webhookService.handleBtrixWebhook(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await webhookService.createEvent(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}



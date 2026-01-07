import { Request, Response, NextFunction } from 'express';
import { calendarQueue } from '../utils/queue';

export class CalendarWebhookController {
  async handleGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      await calendarQueue.add('calendar.webhook.process', {
        provider: 'GOOGLE',
        headers: req.headers,
        payload: req.body,
      });
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async handleMicrosoft(req: Request, res: Response, next: NextFunction) {
    try {
      const validationToken = req.query.validationToken as string | undefined;
      if (validationToken) {
        res.status(200).send(validationToken);
        return;
      }

      await calendarQueue.add('calendar.webhook.process', {
        provider: 'MICROSOFT',
        headers: req.headers,
        payload: req.body,
      });

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}

export const calendarWebhookController = new CalendarWebhookController();


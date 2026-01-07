import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middleware/auth.middleware';

const paymentService = new PaymentService();

export class PaymentController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const { orderId, status, startDate, endDate } = req.query;
      const payments = await paymentService.getAll(companyId, { orderId, status, startDate, endDate });
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const payment = await paymentService.getById(id, companyId);
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const payment = await paymentService.create(companyId, req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyId = req.companyId!;
      const payment = await paymentService.updateStatus(id, status, companyId);
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement Stripe webhook handling
      // For now, just acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async handlePayPalWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement PayPal webhook handling
      // For now, just acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}



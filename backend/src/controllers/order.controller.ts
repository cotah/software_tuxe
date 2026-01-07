import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth.middleware';

const orderService = new OrderService();

export class OrderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const { status, startDate, endDate } = req.query;
      const orders = await orderService.getAll(companyId, { status, startDate, endDate });
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const order = await orderService.getById(id, companyId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const order = await orderService.create(companyId, req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyId = req.companyId!;
      const order = await orderService.updateStatus(id, status, companyId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const companyId = req.companyId!;
      const order = await orderService.assign(id, userId, companyId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      await orderService.delete(id, companyId);
      res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
      next(error);
    }
  }
}



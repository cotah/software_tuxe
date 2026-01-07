import { Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { AuthRequest } from '../middleware/auth.middleware';

const inventoryService = new InventoryService();

export class InventoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const inventory = await inventoryService.getAll(companyId);
      res.json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const products = await inventoryService.getProducts(companyId);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const product = await inventoryService.createProduct(companyId, req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async getItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const items = await inventoryService.getItems(companyId);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async createItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const item = await inventoryService.createItem(companyId, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const item = await inventoryService.updateItem(id, companyId, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const items = await inventoryService.getLowStock(companyId);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }
}



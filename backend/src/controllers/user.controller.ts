import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';

const userService = new UserService();

export class UserController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const users = await userService.getAll(companyId);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const currentUserId = req.userId!;
      const currentRole = req.role!;

      // Users can view their own profile, admins can view anyone
      const targetId = currentRole === 'ADMIN' ? id : currentUserId;

      const user = await userService.getById(targetId, companyId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId!;
      const user = await userService.create(companyId, req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const currentUserId = req.userId!;
      const currentRole = req.role!;

      // Users can update their own profile, admins can update anyone
      const targetId = currentRole === 'ADMIN' ? id : currentUserId;

      const user = await userService.update(targetId, companyId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      const user = await userService.toggleStatus(id, companyId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      await userService.delete(id, companyId);
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  }
}



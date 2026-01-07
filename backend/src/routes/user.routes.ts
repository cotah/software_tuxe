import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const userController = new UserController();

router.use(authenticate);

router.get('/', requireRole(UserRole.ADMIN), (req, res, next) => userController.getAll(req, res, next));
router.get('/:id', (req, res, next) => userController.getById(req, res, next));
router.post('/', requireRole(UserRole.ADMIN), (req, res, next) => userController.create(req, res, next));
router.put('/:id', (req, res, next) => userController.update(req, res, next));
router.patch('/:id/status', requireRole(UserRole.ADMIN), (req, res, next) => userController.toggleStatus(req, res, next));
router.delete('/:id', requireRole(UserRole.ADMIN), (req, res, next) => userController.delete(req, res, next));

export default router;



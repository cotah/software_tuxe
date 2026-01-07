import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

router.use(authenticate);

router.get('/', (req, res, next) => orderController.getAll(req, res, next));
router.get('/:id', (req, res, next) => orderController.getById(req, res, next));
router.post('/', (req, res, next) => orderController.create(req, res, next));
router.patch('/:id/status', (req, res, next) => orderController.updateStatus(req, res, next));
router.patch('/:id/assign', (req, res, next) => orderController.assign(req, res, next));
router.delete('/:id', (req, res, next) => orderController.delete(req, res, next));

export default router;



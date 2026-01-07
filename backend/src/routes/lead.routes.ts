import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => leadController.list(req as any, res, next));
router.get('/:id', (req, res, next) => leadController.getById(req as any, res, next));
router.patch('/:id', (req, res, next) => leadController.update(req as any, res, next));
router.post('/:id/status', (req, res, next) => leadController.changeStatus(req as any, res, next));

export default router;


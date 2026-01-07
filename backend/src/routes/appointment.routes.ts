import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => appointmentController.create(req, res, next));
router.get('/', (req, res, next) => appointmentController.list(req as any, res, next));
router.get('/:id', (req, res, next) => appointmentController.getById(req as any, res, next));
router.patch('/:id', (req, res, next) => appointmentController.update(req as any, res, next));
router.post('/:id/status', (req, res, next) => appointmentController.changeStatus(req as any, res, next));
router.get('/:id/ics', (req, res, next) => appointmentController.downloadICS(req as any, res, next));

export default router;


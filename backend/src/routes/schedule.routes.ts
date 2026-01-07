import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const scheduleController = new ScheduleController();

router.use(authenticate);

router.get('/', (req, res, next) => scheduleController.getAll(req, res, next));
router.get('/:id', (req, res, next) => scheduleController.getById(req, res, next));
router.post('/', (req, res, next) => scheduleController.create(req, res, next));
router.put('/:id', (req, res, next) => scheduleController.update(req, res, next));
router.delete('/:id', (req, res, next) => scheduleController.delete(req, res, next));

export default router;



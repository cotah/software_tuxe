import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/providers', (req, res, next) => calendarController.listProviders(req as any, res, next));
router.post('/:provider/connect', (req, res, next) => calendarController.connect(req as any, res, next));
router.get('/:provider/callback', (req, res, next) => calendarController.callback(req as any, res, next));
router.post('/:provider/disconnect', (req, res, next) => calendarController.disconnect(req as any, res, next));
router.post('/:provider/sync/push/:appointmentId', (req, res, next) =>
  calendarController.pushSync(req as any, res, next)
);
router.post('/:provider/sync/pull', (req, res, next) =>
  calendarController.pullSync(req as any, res, next)
);

export default router;


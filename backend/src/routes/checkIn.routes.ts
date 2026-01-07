import { Router } from 'express';
import { CheckInController } from '../controllers/checkIn.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const checkInController = new CheckInController();

router.use(authenticate);

router.post('/check-in', (req, res, next) => checkInController.checkIn(req, res, next));
router.post('/check-out', (req, res, next) => checkInController.checkOut(req, res, next));
router.get('/my-history', (req, res, next) => checkInController.getMyHistory(req, res, next));
router.get('/history', (req, res, next) => checkInController.getAllHistory(req, res, next));

export default router;



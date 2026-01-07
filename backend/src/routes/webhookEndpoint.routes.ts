import { Router } from 'express';
import { webhookEndpointController } from '../controllers/webhookEndpoint.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => webhookEndpointController.list(req as any, res, next));
router.post('/', (req, res, next) => webhookEndpointController.create(req as any, res, next));

export default router;


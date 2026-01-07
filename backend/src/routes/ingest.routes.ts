import { Router } from 'express';
import { ingestController } from '../controllers/ingest.controller';

const router = Router();

router.post('/manychat', (req, res, next) => ingestController.ingestManyChat(req, res, next));
router.post('/website', (req, res, next) => ingestController.ingestWebsite(req, res, next));

export default router;


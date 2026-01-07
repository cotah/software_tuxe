import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const serviceController = new ServiceController();

router.use(authenticate);

router.get('/', (req, res, next) => serviceController.getAll(req, res, next));
router.get('/:id', (req, res, next) => serviceController.getById(req, res, next));
router.post('/', (req, res, next) => serviceController.create(req, res, next));
router.put('/:id', (req, res, next) => serviceController.update(req, res, next));
router.delete('/:id', (req, res, next) => serviceController.delete(req, res, next));

export default router;



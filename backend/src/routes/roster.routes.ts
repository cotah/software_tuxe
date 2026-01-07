import { Router } from 'express';
import { RosterController } from '../controllers/roster.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const rosterController = new RosterController();

router.use(authenticate);

router.get('/', (req, res, next) => rosterController.getAll(req, res, next));
router.get('/my-roster', (req, res, next) => rosterController.getMyRoster(req, res, next));
router.post('/', (req, res, next) => rosterController.create(req, res, next));
router.put('/:id', (req, res, next) => rosterController.update(req, res, next));
router.delete('/:id', (req, res, next) => rosterController.delete(req, res, next));

export default router;



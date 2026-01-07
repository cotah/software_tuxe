import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

router.use(authenticate);

router.get('/', (req, res, next) => paymentController.getAll(req, res, next));
router.get('/:id', (req, res, next) => paymentController.getById(req, res, next));
router.post('/', (req, res, next) => paymentController.create(req, res, next));
router.post('/stripe-webhook', paymentController.handleStripeWebhook);
router.post('/paypal-webhook', paymentController.handlePayPalWebhook);
router.patch('/:id/status', (req, res, next) => paymentController.updateStatus(req, res, next));

export default router;



import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const inventoryController = new InventoryController();

router.use(authenticate);

router.get('/', (req, res, next) => inventoryController.getAll(req, res, next));
router.get('/products', (req, res, next) => inventoryController.getProducts(req, res, next));
router.post('/products', (req, res, next) => inventoryController.createProduct(req, res, next));
router.get('/items', (req, res, next) => inventoryController.getItems(req, res, next));
router.post('/items', (req, res, next) => inventoryController.createItem(req, res, next));
router.patch('/items/:id', (req, res, next) => inventoryController.updateItem(req, res, next));
router.get('/low-stock', (req, res, next) => inventoryController.getLowStock(req, res, next));

export default router;



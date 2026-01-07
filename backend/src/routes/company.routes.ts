import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const companyController = new CompanyController();

router.use(authenticate);

router.get('/', (req, res, next) => companyController.getMyCompany(req, res, next));
router.put('/', requireRole(UserRole.ADMIN), (req, res, next) => companyController.update(req, res, next));
router.get('/settings', (req, res, next) => companyController.getSettings(req, res, next));
router.put('/settings', requireRole(UserRole.ADMIN), (req, res, next) => companyController.updateSettings(req, res, next));

export default router;



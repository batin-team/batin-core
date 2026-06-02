import { Router } from 'express';
import { onboardProvider, verifyProvider, addLocation, getProviders, getPendingProviders } from '../controllers/provider';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getProviders);
router.get('/pending', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getPendingProviders);
router.post('/onboard', authenticate, onboardProvider);
router.patch('/:providerId/verify', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), verifyProvider);
router.post('/:providerId/locations', authenticate, addLocation);

export default router;

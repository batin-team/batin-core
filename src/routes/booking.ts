import { Router } from 'express';
import { createLock, confirmBooking, getMyBookings } from '../controllers/booking';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/lock', authenticate, createLock);
router.post('/confirm', authenticate, confirmBooking);
router.get('/my', authenticate, getMyBookings);

export default router;

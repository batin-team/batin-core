import { Router } from 'express';
import { submitReview } from '../controllers/review';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, submitReview);

export default router;

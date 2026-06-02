import { Router } from 'express';
import { submitAssessment, getResources } from '../controllers/assessment';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/submit', authenticate, submitAssessment);
router.get('/resources', getResources);

export default router;

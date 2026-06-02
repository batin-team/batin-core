import { Router } from 'express';
import { submitInquiry } from '../controllers/corporate';

const router = Router();

router.post('/inquiry', submitInquiry);

export default router;

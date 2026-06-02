import { Router } from 'express';
import { getStats, getAuditLogs } from '../controllers/analytics';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Expose dashboard views to ADMIN and SUPER_ADMIN users
router.get('/stats', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getStats);
router.get('/audit-logs', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getAuditLogs);

export default router;

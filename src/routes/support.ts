import { Router } from 'express';
import { createTicket, updateTicketStatus, getTickets, getUserTickets } from '../controllers/support';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Retrieve all tickets (Admin only)
router.get('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getTickets);

// Retrieve tickets for current authenticated user
router.get('/my', authenticate, getUserTickets);

// Create a new support ticket
router.post('/', authenticate, createTicket);

// Update status of a ticket (Admin only)
router.patch('/tickets/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), updateTicketStatus);

export default router;

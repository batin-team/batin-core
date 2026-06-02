import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

export const authService = {
  login: (data: any) => API.post('/auth/login', data),
  register: (data: any) => API.post('/auth/register', data)
};

export const providerService = {
  onboard: (data: any) => API.post('/providers/onboard', data),
  getProviders: () => API.get('/providers'),
  getPendingProviders: () => API.get('/providers/pending'),
  verifyProvider: (providerId: string, status: 'APPROVED' | 'ACTIVE' | 'REJECTED') => API.patch(`/providers/${providerId}/verify`, { status })
};

export const bookingService = {
  createLock: (data: { providerId: string; startTime: string }) => API.post('/bookings/lock', data),
  confirmBooking: (data: { lockId: string }) => API.post('/bookings/confirm', data),
  getMyBookings: () => API.get('/bookings/my')
};

export const assessmentService = {
  submit: (data: any) => API.post('/assessments/submit', data),
  getResources: (location?: string) => API.get('/assessments/resources', { params: { location } })
};

export const corporateService = {
  submitInquiry: (data: { name: string; email: string; company: string; message: string }) => API.post('/corporate/inquiry', data)
};

export const reviewService = {
  submitReview: (data: { appointmentId: string; rating: number; comment?: string; isAnonymous?: boolean }) => API.post('/reviews', data)
};

export const analyticsService = {
  getStats: () => API.get('/analytics/stats'),
  getAuditLogs: () => API.get('/analytics/audit-logs')
};

export const supportService = {
  getTickets: () => API.get('/support'),
  getUserTickets: () => API.get('/support/my'),
  createTicket: (data: { subject: string; message: string }) => API.post('/support', data),
  updateTicketStatus: (ticketId: string, status: string) => API.patch(`/support/tickets/${ticketId}`, { status })
};

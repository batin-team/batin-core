import { BookingService } from './services/booking';

const CLEANUP_INTERVAL = 1 * 60 * 1000; // 1 minute

export const startBackgroundJobs = () => {
  console.log('Starting background jobs...');
  
  setInterval(async () => {
    try {
      await BookingService.cleanupExpiredLocks();
    } catch (error) {
      console.error('Lock Cleanup Error:', error);
    }
  }, CLEANUP_INTERVAL);
};

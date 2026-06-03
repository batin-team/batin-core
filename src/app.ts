import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { auditMiddleware } from './middleware/audit';
import authRoutes from './routes/auth';
import providerRoutes from './routes/provider';
import bookingRoutes from './routes/booking';
import assessmentRoutes from './routes/assessment';
import corporateRoutes from './routes/corporate';
import reviewRoutes from './routes/review';
import analyticsRoutes from './routes/analytics';
import supportRoutes from './routes/support';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CORS_ORIGIN,      // e.g. https://hatikehati.vercel.app
    ].filter(Boolean);
    
    // Allow same-origin requests (origin is undefined), listed origins, or any Vercel deployments
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      // Return false instead of throwing Error to prevent a 500 response on the server
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Apply audit middleware globally for Phase 1
app.use(auditMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message || err
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

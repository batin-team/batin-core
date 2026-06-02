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
    // Allow same-origin requests (origin is undefined) and listed origins
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} not allowed`));
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

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

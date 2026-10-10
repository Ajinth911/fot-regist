import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { initDatabase } from './db/database';
import authRoutes from './routes/auth';
import eventRoutes from './routes/event';
import registrationRoutes from './routes/registrations';
import scannerRoutes from './routes/scanner';
import sheetsRoutes from './routes/sheets';
import exportRoutes from './routes/export';
import statsRoutes from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database schema and seed data
initDatabase();

// Security & Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5000,http://127.0.0.1:5173,http://127.0.0.1:5000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error(`Blocked by CORS policy: Origin ${origin} not allowed.`));
    }
  },
  credentials: true,
}));

// HTTP Security Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files with strict sandbox headers to prevent Stored XSS
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  },
}));

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'FOT Platform' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`⚡ FOT Server running on http://127.0.0.1:${PORT}`);
});

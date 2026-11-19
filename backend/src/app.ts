import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.config';
import { db, isFirebaseInitialized } from './config/firebase.config';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import leadRoutes from './routes/lead.routes';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: env.corsAllowedOrigins,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);

// Endpoint kiểm tra sức khỏe hệ thống (Health Check)
app.get('/api/health', async (_req: Request, res: Response) => {
  let firestoreStatus = 'disconnected';
  let collectionsCount = 0;

  if (isFirebaseInitialized && db) {
    try {
      // Thử đọc danh sách collections để xác thực quyền
      const collections = await db.listCollections();
      firestoreStatus = 'connected';
      collectionsCount = collections.length;
    } catch (err: any) {
      firestoreStatus = `error: ${err.message}`;
    }
  }

  res.json({
    status: 'ok',
    service: 'Skipli Sales Internal API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    firestore: {
      status: firestoreStatus,
      collectionsCount,
    },
    env: env.nodeEnv,
  });
});

export default app;

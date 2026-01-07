import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import patientRoutes from './routes/patientRoutes';
import treatmentRoutes from './routes/treatmentRoutes';
import billingRoutes from './routes/billingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reviewRoutes from './routes/reviewRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

app.get('/', (_req, res) => {
  res.json({
    message: 'Dental Practice Management API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(err, req, res, next);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export { io };

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

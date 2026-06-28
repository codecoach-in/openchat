import express, { Application } from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.middleware';
import { notFound } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/error.middleware';
import roomRoutes from './routes/room.routes';
import messageRoutes from './routes/message.routes';

const app: Application = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// API Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('OpenChat TypeScript API is running.');
});

// Error handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;

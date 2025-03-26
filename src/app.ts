import express, { Application } from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import { initWebSocket } from './app/modules/meeting/websocket';

const createApp = (): Application => {
  const app: Application = express();
  const server = http.createServer(app);

  // Configure CORS
  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'socket.io-version'
    ]
  };

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  // WebSocket Initialization (before routes)
  initWebSocket(server);

  // API Routes
  app.use('/api/v1', router);

  // Error Handling
  app.use(globalErrorHandler);
  app.use(notFound);

  return app;
};

export default createApp;
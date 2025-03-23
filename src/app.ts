// app.ts
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const createApp = (): Application => {
  const app: Application = express();

  // Parsers
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));

  // Application routes
  app.use('/api/v1', router);

  // Error handling
  app.use(globalErrorHandler);
  app.use(notFound);

  return app;
};

export default createApp;
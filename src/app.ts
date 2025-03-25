// app.ts
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const createApp = (): Application => {
  const app: Application = express();

  // Configure CORS properly
  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'http://localhost:5000' // Add your backend origin if needed
    ],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'socket.io-version'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  };

  // Apply CORS middleware
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // Enable pre-flight requests

  // Parsers
  app.use(express.json());
  app.use(cookieParser());

  // Add security headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    next();
  });

  // Application routes
  app.use('/api/v1', router);

  // Error handling
  app.use(globalErrorHandler);
  app.use(notFound);

  return app;
};

export default createApp;
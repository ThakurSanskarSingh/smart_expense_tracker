/**
 * @fileoverview Express application factory and middleware configuration.
 * Hardened with Helmet, CORS, Rate Limiting, NoSQL injection sanitization,
 * and centralized error formatting.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';
import apiRoutes from './routes/index.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman) or matching CLIENT_ORIGIN
      if (!origin || origin === config.clientOrigin || config.clientOrigin === '*') {
        return callback(null, true);
      }
      callback(new AppError(`CORS policy blocks access from origin ${origin}`, 403, 'CORS_ERROR'));
    },
    credentials: true,
  }),
);

// Apply rate limiter to API routes in non-test environments
if (config.nodeEnv !== 'test') {
  app.use('/api', apiLimiter);
}

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize NoSQL query injection
app.use(mongoSanitize());

// Mount API router
app.use('/api', apiRoutes);

// Catch unhandled 404 routes
app.all('*', (req, _res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404, 'ROUTE_NOT_FOUND'));
});

// Central error handler
app.use(errorHandler);

export default app;

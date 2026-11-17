/**
 * @fileoverview Central error handling middleware for Express application.
 * Formats all errors into standardized `{ success: false, error: { code, message } }` responses.
 */

import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Express error handling middleware function.
 * @param {Error} err - Error object.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} _next - Express next function.
 */
export function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    code = 'DATABASE_VALIDATION_ERROR';
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    message = `Duplicate value entered for ${field}.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_IDENTIFIER';
    message = `Invalid resource ID format: ${err.value}`;
  } else {
    logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}:`, err);
    if (process.env.NODE_ENV === 'development') {
      message = err.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

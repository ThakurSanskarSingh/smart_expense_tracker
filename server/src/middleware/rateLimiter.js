/**
 * @fileoverview API rate limiting middleware using express-rate-limit.
 * Enforces security limits to protect endpoints against brute force and denial of service.
 */

import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter: 100 requests per 15 minutes window.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
  },
});

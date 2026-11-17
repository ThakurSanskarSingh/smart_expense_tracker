/**
 * @fileoverview Async handler wrapper to catch and forward asynchronous errors to Express middleware.
 */

/**
 * Wraps an async route handler function to automatically catch rejected promises.
 * @param {Function} fn - Asynchronous Express route handler or middleware.
 * @returns {import('express').RequestHandler} Express request handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

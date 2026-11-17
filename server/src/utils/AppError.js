/**
 * @fileoverview Custom operational error class for normalized API error handling.
 */

/**
 * Custom application error with HTTP status code and machine-readable error code.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} [statusCode=500] - HTTP status code.
   * @param {string} [code='INTERNAL_ERROR'] - Machine-readable error code.
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

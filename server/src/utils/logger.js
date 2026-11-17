/**
 * @fileoverview Application logger utility for structured server console logging.
 */

/**
 * Standard formatted logger.
 */
export const logger = {
  /**
   * Logs an informational message.
   * @param {string} message - Message text.
   * @param {object} [meta] - Optional metadata object.
   */
  info: (message, meta) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },

  /**
   * Logs a warning message.
   * @param {string} message - Warning message.
   * @param {object} [meta] - Optional metadata object.
   */
  warn: (message, meta) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },

  /**
   * Logs an error message and stack trace.
   * @param {string} message - Error description.
   * @param {Error|object} [error] - Error instance or details.
   */
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error?.stack || error || '');
  },
};

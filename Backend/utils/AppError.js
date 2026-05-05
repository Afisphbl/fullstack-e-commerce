'use strict';

/**
 * Custom operational error class.
 * Only instances of AppError are sent with full detail to the client;
 * all other errors are treated as programming errors.
 */
class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message
   * @param {number} statusCode - HTTP status code (4xx / 5xx)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack without AppError constructor frame
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

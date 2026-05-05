'use strict';

const AppError = require('../utils/AppError');
const logger = require('../logs/logger');

// ─── Specific Mongoose / JWT error converters ─────────────────────────────────
const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue?.[field] ?? '';
  return new AppError(
    `Duplicate value for '${field}': "${value}". Please use another value.`,
    409
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${errors.join('. ')}`, 422);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ─── Dev response (full detail) ────────────────────────────────────────────────
const sendErrorDev = (err, req, res) => {
  logger.error(`${err.statusCode} — ${req.method} ${req.originalUrl} — ${err.message}`, {
    stack: err.stack,
  });
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// ─── Prod response (safe detail only) ─────────────────────────────────────────
const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    logger.warn(`${err.statusCode} — ${req.method} ${req.originalUrl} — ${err.message}`);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or unknown error — don't leak details
  logger.error('UNEXPECTED ERROR', { message: err.message, stack: err.stack });
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

// ─── Normalise error type (runs in BOTH dev and prod) ────────────────────────
const normaliseError = (err) => {
  if (err.name === 'CastError')       return handleCastErrorDB(err);
  if (err.code === 11000)             return handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') return handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') return handleJWTError();
  if (err.name === 'TokenExpiredError') return handleJWTExpiredError();
  return err;
};

// ─── Global error-handling middleware ─────────────────────────────────────────
const globalErrorHandler = (err, req, res, next) => {
  // Normalise known DB / JWT errors first so status codes are always correct
  const error = normaliseError(err);

  error.statusCode = error.statusCode || 500;
  error.status     = error.status     || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

module.exports = globalErrorHandler;

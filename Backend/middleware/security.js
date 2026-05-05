'use strict';

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');

// ─── Helmet — HTTP security headers ──────────────────────────────────────────
const helmetMiddleware = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many login attempts. Please try again in 1 hour.',
  },
});

// ─── HPP — HTTP parameter pollution prevention ────────────────────────────────
const hppMiddleware = hpp({
  whitelist: ['price', 'ratingsAverage', 'ratingsQuantity', 'sort', 'fields'],
});

// ─── Compression ──────────────────────────────────────────────────────────────
const compressionMiddleware = compression();

module.exports = {
  helmetMiddleware,
  globalLimiter,
  authLimiter,
  hppMiddleware,
  compressionMiddleware,
};

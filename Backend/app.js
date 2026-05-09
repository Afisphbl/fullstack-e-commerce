'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

// ── Config (must be first) ─────────────────────────────────────────────────────
require('./config/env');

// ── Security middleware ───────────────────────────────────────────────────────
const {
  helmetMiddleware,
  globalLimiter,
  hppMiddleware,
  compressionMiddleware,
} = require('./middleware/security');
const { xssSanitize, noSQLSanitize } = require('./middleware/sanitize');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes     = require('./routes/authRoutes');
const userRoutes     = require('./routes/userRoutes');
const productRoutes  = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes   = require('./routes/reviewRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const couponRoutes   = require('./routes/couponRoutes');
const cartRoutes     = require('./routes/cartRoutes');
const specificationRoutes = require('./routes/specificationRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// ── Error handling ────────────────────────────────────────────────────────────
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const logger = require('./logs/logger');

// ─────────────────────────────────────────────────────────────────────────────
const app = express();

// ── Trust proxy (needed for rate-limiter behind nginx/load-balancer) ──────────
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
  })
);
app.options('*', cors());

// ── HTTP security headers ─────────────────────────────────────────────────────
app.use(helmetMiddleware);

// ── Request logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use('/api', globalLimiter);

// ── Body & cookie parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Data sanitisation ─────────────────────────────────────────────────────────
app.use(noSQLSanitize); // NoSQL injection
app.use(xssSanitize);   // XSS

// ── HTTP parameter pollution ──────────────────────────────────────────────────
app.use(hppMiddleware);

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compressionMiddleware);

// ── Static files ──────────────────────────────────────────────────────────────
app.use('/public', express.static(path.join(__dirname, 'public')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'E-Commerce API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API v1 routes ─────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`,       authRoutes);
app.use(`${API_PREFIX}/users`,      userRoutes);
app.use(`${API_PREFIX}/products`,   productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/reviews`,    reviewRoutes);
app.use(`${API_PREFIX}/orders`,     orderRoutes);
app.use(`${API_PREFIX}/coupons`,    couponRoutes);
app.use(`${API_PREFIX}/cart`,       cartRoutes);
app.use(`${API_PREFIX}/specifications`, specificationRoutes);
app.use(`${API_PREFIX}/wishlist`,   wishlistRoutes);

// ── 404 — unmatched routes ────────────────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;

'use strict';

// Load env first — before anything else imports process.env
require('./config/env');

const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./logs/logger');

const PORT = process.env.PORT || 5000;

// ─── Uncaught exception handler (sync errors) ─────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION — shutting down...', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// ─── Start server after DB connects ──────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // ─── Unhandled promise rejection handler ─────────────────────────────────
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION — shutting down gracefully...', {
      message: err.message,
      stack: err.stack,
    });
    server.close(() => process.exit(1));
  });

  // ─── Graceful shutdown on SIGTERM (Docker / Kubernetes) ──────────────────
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received — closing HTTP server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
    });
  });

  // ─── Graceful shutdown on SIGINT (Ctrl+C) ────────────────────────────────
  process.on('SIGINT', () => {
    logger.info('SIGINT received — closing HTTP server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  });
};

startServer();

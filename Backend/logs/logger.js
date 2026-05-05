'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;
const env = process.env.NODE_ENV || 'development';

// ─── Custom console format ────────────────────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

// ─── Transports ───────────────────────────────────────────────────────────────
const transports = [];

if (env === 'development') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
    })
  );
} else {
  // Structured JSON for production log aggregators
  transports.push(
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

// Rotating error log
transports.push(
  new DailyRotateFile({
    filename: path.join(__dirname, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: combine(timestamp(), errors({ stack: true }), json()),
  })
);

// Rotating combined log
transports.push(
  new DailyRotateFile({
    filename: path.join(__dirname, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: combine(timestamp(), errors({ stack: true }), json()),
  })
);

// ─── Logger instance ──────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: env === 'production' ? 'warn' : 'debug',
  transports,
  exitOnError: false,
});

module.exports = logger;

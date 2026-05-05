'use strict';

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

/**
 * Sanitize req.body values against XSS using the `xss` library.
 * Runs recursively over nested objects.
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') return xss(value);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      cleaned[key] = sanitizeValue(value[key]);
    }
    return cleaned;
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  return value;
};

const xssSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

// Re-export mongoSanitize so it can be mounted in app.js alongside xssSanitize
const noSQLSanitize = mongoSanitize({ replaceWith: '_' });

module.exports = { xssSanitize, noSQLSanitize };

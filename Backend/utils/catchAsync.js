'use strict';

/**
 * Wraps an async route handler to automatically forward any rejection
 * to the next() error middleware — eliminates repetitive try/catch blocks.
 *
 * @param {Function} fn - async (req, res, next) => Promise<void>
 * @returns {Function}
 */
const catchAsync = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;

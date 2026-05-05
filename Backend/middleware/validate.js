'use strict';

const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * validate — reads express-validator results and short-circuits the
 * request with a 422 error when any rule fails.
 *
 * Place after your validation rule arrays in a route:
 *   router.post('/', [...rules], validate, controller.createOne)
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const messages = errors
    .array({ onlyFirstError: true })
    .map((e) => `${e.path}: ${e.msg}`)
    .join('; ');

  return next(new AppError(`Validation failed — ${messages}`, 422));
};

module.exports = validate;

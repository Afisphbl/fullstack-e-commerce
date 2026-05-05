'use strict';

/**
 * setForeignKey middleware factory.
 *
 * Automatically assigns a foreign-key field on req.body from req.params or
 * req.user so that nested route controllers receive the correct association
 * without duplicating that logic in every controller.
 *
 * Usage (in a router):
 *   router.use(setForeignKey('product', 'productId'));   // from req.params
 *   router.use(setForeignKey('user'));                   // from req.user._id
 */
const setForeignKey = (field, paramName = null) =>
  (req, _res, next) => {
    if (paramName) {
      // from route param (e.g. :productId)
      if (!req.body[field] && req.params[paramName]) {
        req.body[field] = req.params[paramName];
      }
    } else {
      // from authenticated user
      if (!req.body[field] && req.user) {
        req.body[field] = req.user._id;
      }
    }
    next();
  };

module.exports = setForeignKey;

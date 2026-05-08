'use strict';

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/env');
const MESSAGES = require('../constants/messages');

// ─── Sign a JWT ───────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// ─── Send token response (cookie only) ────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_EXPIRES_IN_DAYS || '7', 10) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // DO NOT send token in response body - it's in the cookie
  res.status(statusCode).json({
    status: 'success',
    data: { user },
  });
};

// ─── protect — verify JWT, attach req.user ────────────────────────────────────
const protect = catchAsync(async (req, res, next) => {
  // 1) Extract token from header or cookie
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError(MESSAGES.TOKEN_MISSING, 401));

  // 2) Verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, config.jwtSecret);
  } catch {
    return next(new AppError(MESSAGES.TOKEN_INVALID, 401));
  }

  // 3) Check user still exists
  const currentUser = await User.findById(decoded.id)
    .select('+passwordChangedAt +active')
    .setOptions({ includeInactive: true });

  if (!currentUser) return next(new AppError(MESSAGES.TOKEN_INVALID, 401));

  // 3.5) Check if user account is suspended or inactive
  if (currentUser.status === 'suspended' || currentUser.active === false) {
    return next(
      new AppError(
        'Your account has been suspended. Please contact support for assistance.',
        403
      )
    );
  }

  // 4) Check password not changed after token issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError(MESSAGES.TOKEN_INVALID, 401));

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// ─── restrictTo — role-based access control ───────────────────────────────────
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError(MESSAGES.NOT_AUTHORIZED, 403));
    next();
  };

module.exports = { protect, restrictTo, signToken, sendTokenResponse };

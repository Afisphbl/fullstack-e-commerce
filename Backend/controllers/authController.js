'use strict';

const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');

exports.signup = catchAsync(async (req, res, next) => {
  await authService.signup(req.body, res);
});

exports.login = catchAsync(async (req, res, next) => {
  await authService.login(req.body, res, next);
});

exports.logout = (req, res) => {
  authService.logout(res);
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const result = await authService.forgotPassword(req.body, req, next);
  if (result) {
    res.status(200).json({ status: 'success', message: result.message });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  await authService.resetPassword(
    {
      token: req.params.token,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    },
    res,
    next
  );
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  await authService.updatePassword(
    {
      currentUser: req.user,
      passwordCurrent: req.body.passwordCurrent,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    },
    res,
    next
  );
});

"use strict";

const crypto = require("crypto");
const User = require("../models/userModel");
const config = require("../config/env");
const AppError = require("../utils/AppError");
const { sendTokenResponse } = require("../middleware/auth");
const { sendPasswordResetEmail, sendWelcomeEmail } = require("../utils/email");
const MESSAGES = require("../constants/messages");
const logger = require("../logs/logger");

// ─── signup ───────────────────────────────────────────────────────────────────
const signup = async (body, res) => {
  const { name, email, password, passwordConfirm, role } = body;

  // Prevent privilege escalation through the request body
  const newUser = await User.create({ name, email, password, passwordConfirm });

  // Send welcome email in background (don't block the response)
  sendWelcomeEmail({ email: newUser.email, name: newUser.name }).catch(
    (err) => {
      logger.error(`📧 Failed to send welcome email to ${newUser.email}:`, err);
    },
  );

  sendTokenResponse(newUser, 201, res);
};

// ─── login ────────────────────────────────────────────────────────────────────
const login = async ({ email, password }, res, next) => {
  if (!email || !password)
    return next(new AppError(MESSAGES.INVALID_CREDENTIALS, 400));

  // Include inactive users to check if they're suspended
  const user = await User.findOne({ email })
    .select("+password +active")
    .setOptions({ includeInactive: true });

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError(MESSAGES.INVALID_CREDENTIALS, 401));

  // Check if user account is suspended
  if (user.status === "suspended" || user.active === false) {
    return next(
      new AppError(
        "Your account has been suspended. Please contact support for assistance.",
        403,
      ),
    );
  }

  // Non-blocking lastLogin update - don't fail auth if this fails
  User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }).catch(
    (err) => {
      // Log error but don't block authentication
      logger.error("Failed to update lastLogin:", err);
    },
  );

  sendTokenResponse(user, 200, res);
};

// ─── logout ───────────────────────────────────────────────────────────────────
const logout = (res) => {
  res.cookie("jwt", "logged-out", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    sameSite: "strict",
  });
  res.status(200).json({ status: "success", message: MESSAGES.LOGOUT_SUCCESS });
};

// ─── forgotPassword ───────────────────────────────────────────────────────────
const forgotPassword = async ({ email }, next) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("No user found with that email address.", 404);

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${config.email.clientUrl}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetURL,
    });
    return { message: MESSAGES.PASSWORD_RESET_EMAIL_SENT };
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Failed to send reset email. Please try again.", 500);
  }
};

// ─── resetPassword ────────────────────────────────────────────────────────────
const resetPassword = async (
  { token, password, passwordConfirm },
  res,
  next,
) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired.", 400));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// ─── updatePassword ───────────────────────────────────────────────────────────
const updatePassword = async (
  { currentUser, passwordCurrent, password, passwordConfirm },
  res,
  next,
) => {
  const user = await User.findById(currentUser._id).select("+password");

  if (!(await user.correctPassword(passwordCurrent, user.password)))
    return next(new AppError("Your current password is incorrect.", 401));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  sendTokenResponse(user, 200, res);
};

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
};

'use strict';

const MESSAGES = Object.freeze({
  // Auth
  SIGNUP_SUCCESS: 'Account created successfully.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successful. Please log in.',
  PASSWORD_UPDATED: 'Password updated successfully.',
  INVALID_CREDENTIALS: 'Incorrect email or password.',
  ACCOUNT_INACTIVE: 'Your account has been deactivated. Contact support.',
  TOKEN_INVALID: 'Invalid or expired token. Please log in again.',
  TOKEN_MISSING: 'You are not logged in. Please provide a token.',
  NOT_AUTHORIZED: 'You do not have permission to perform this action.',

  // General CRUD
  CREATED: 'Resource created successfully.',
  FETCHED: 'Resource fetched successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  NOT_FOUND: 'No resource found with that ID.',

  // Validation
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  DUPLICATE_FIELD: 'A record with that value already exists.',

  // Server
  SERVER_ERROR: 'Something went wrong. Please try again later.',
});

module.exports = MESSAGES;

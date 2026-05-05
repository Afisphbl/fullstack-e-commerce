'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../logs/logger');

// ─── Transporter ──────────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.username,
      pass: config.email.password,
    },
  });

// ─── Base send function ───────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent: ${info.messageId} → ${to}`);
  return info;
};

// ─── Template helpers ─────────────────────────────────────────────────────────
/**
 * Send a password-reset email.
 * @param {object} opts
 * @param {string} opts.email       - recipient address
 * @param {string} opts.name        - recipient first name
 * @param {string} opts.resetURL    - full reset URL
 */
const sendPasswordResetEmail = async ({ email, name, resetURL }) => {
  const subject = 'E-Commerce — Password Reset (valid 10 minutes)';
  const text = `Hi ${name},\n\nYou requested a password reset.\n\nClick the link below to reset your password:\n${resetURL}\n\nIf you did not request this, please ignore this email.\n\nThe E-Commerce Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2 style="color:#2d3748;">Password Reset Request</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>You requested to reset your password. Click the button below (link expires in <strong>10 minutes</strong>):</p>
      <a href="${resetURL}"
         style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
        Reset Password
      </a>
      <p style="margin-top:24px;color:#718096;font-size:12px;">
        If you did not request this, please ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send a welcome / confirmation email.
 */
const sendWelcomeEmail = async ({ email, name }) => {
  const subject = 'Welcome to E-Commerce!';
  const text = `Hi ${name},\n\nWelcome aboard! Your account has been created successfully.\n\nHappy shopping!\nThe E-Commerce Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2 style="color:#2d3748;">Welcome to E-Commerce, ${name}! 🎉</h2>
      <p>Your account has been created successfully. Start exploring thousands of products today.</p>
      <p style="margin-top:24px;color:#718096;font-size:12px;">
        If you did not create this account, please contact support immediately.
      </p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendWelcomeEmail };

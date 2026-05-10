'use strict';

const Message = require('../models/messageModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const { sendContactNotificationEmail } = require('../utils/email');
const logger = require('../logs/logger');

// ── Submit contact form (public) ──────────────────────────────────────────────
exports.submitContactForm = catchAsync(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Capture IP for spam prevention
  const ipAddress =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '';

  const doc = await Message.create({
    name,
    email,
    phone: phone || '',
    subject,
    message,
    ipAddress,
  });

  // Send email notification to owner — non-blocking
  sendContactNotificationEmail({ name, email, phone, subject, message }).catch(
    (err) => logger.warn(`Contact notification email failed: ${err.message}`)
  );

  res.status(201).json({
    status: 'success',
    message: 'Your message has been received. We will get back to you soon!',
    data: { id: doc._id },
  });
});

// ── Mark a single message as read ────────────────────────────────────────────
exports.markAsRead = catchAsync(async (req, res, next) => {
  const doc = await Message.findByIdAndUpdate(
    req.params.id,
    { status: 'read' },
    { new: true, runValidators: true }
  );
  if (!doc) {
    const AppError = require('../utils/AppError');
    return next(new AppError('Message not found.', 404));
  }
  res.status(200).json({ status: 'success', data: { data: doc } });
});

// ── Archive a message ─────────────────────────────────────────────────────────
exports.archiveMessage = catchAsync(async (req, res, next) => {
  const doc = await Message.findByIdAndUpdate(
    req.params.id,
    { status: 'archived' },
    { new: true, runValidators: true }
  );
  if (!doc) {
    const AppError = require('../utils/AppError');
    return next(new AppError('Message not found.', 404));
  }
  res.status(200).json({ status: 'success', data: { data: doc } });
});

// ── Admin CRUD ────────────────────────────────────────────────────────────────
exports.getAllMessages = factory.getAll(Message);
exports.getMessage    = factory.getOne(Message);
exports.deleteMessage = factory.deleteOne(Message);

// ── Unread count (for sidebar badge) ─────────────────────────────────────────
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Message.countDocuments({ status: 'unread' });
  res.status(200).json({ status: 'success', data: { count } });
});


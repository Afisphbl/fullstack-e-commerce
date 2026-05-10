'use strict';

const Message = require('../models/messageModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const { sendContactNotificationEmail } = require('../utils/email');
const { hashIpAddress, extractIpAddress } = require('../utils/hashIp');
const logger = require('../logs/logger');

// ── Submit contact form (public) ──────────────────────────────────────────────
exports.submitContactForm = catchAsync(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Extract and hash IP for spam prevention (privacy-preserving)
  const ipAddress = extractIpAddress(req);
  const hashedIp = hashIpAddress(ipAddress);

  const doc = await Message.create({
    name,
    email,
    phone: phone || '',
    subject,
    message,
    hashedIp,
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
// Custom getAll for messages with status counts
exports.getAllMessages = catchAsync(async (req, res) => {
  const Message = require('../models/messageModel');
  const APIFeatures = require('../utils/APIFeatures');
  const MESSAGES = require('../constants/messages');

  const filter = req.filterObj || {};

  const features = new APIFeatures(Message.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Get paginated messages
  const docs = await features.query.lean({ virtuals: false });
  
  // Get total count (respects filters)
  const total = await Message.countDocuments({
    ...filter,
    ...features._filter,
  });

  // Get aggregate counts by status across ALL messages (ignore status filter)
  // Only apply search filter if present, not status filter
  const aggregateFilter = { ...filter };
  const searchFilter = {};
  
  // Extract search filter from features._filter (if exists)
  if (features._filter) {
    Object.keys(features._filter).forEach(key => {
      // Include all filters EXCEPT status
      if (key !== 'status') {
        searchFilter[key] = features._filter[key];
      }
    });
  }

  const statusCounts = await Message.aggregate([
    { $match: { ...aggregateFilter, ...searchFilter } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Convert to object format
  const countsByStatus = {
    unread: 0,
    read: 0,
    archived: 0,
  };
  
  statusCounts.forEach(({ _id, count }) => {
    if (_id && countsByStatus.hasOwnProperty(_id)) {
      countsByStatus[_id] = count;
    }
  });

  res.status(200).json({
    status: 'success',
    message: MESSAGES.FETCHED,
    results: docs.length,
    total,
    page: features._page,
    limit: features._limit,
    countsByStatus, // Add aggregate counts (across all statuses)
    data: { data: docs },
  });
});

exports.getMessage = factory.getOne(Message);
exports.deleteMessage = factory.deleteOne(Message);

// ── Unread count (for sidebar badge) ─────────────────────────────────────────
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Message.countDocuments({ status: 'unread' });
  res.status(200).json({ status: 'success', data: { count } });
});


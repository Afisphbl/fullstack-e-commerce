'use strict';

const mongoose = require('mongoose');

const MESSAGE_STATUSES = ['unread', 'read', 'archived'];

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [60, 'Name must be at most 60 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      maxlength: [200, 'Subject must be at most 200 characters.'],
    },
    message: {
      type: String,
      required: [true, 'Message body is required.'],
      trim: true,
      maxlength: [5000, 'Message must be at most 5000 characters.'],
    },
    status: {
      type: String,
      enum: MESSAGE_STATUSES,
      default: 'unread',
    },
    hashedIp: {
      type: String,
      select: false, // Never expose in queries
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days retention
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ email: 1 });

// TTL index: automatically delete documents after expiresAt date
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;

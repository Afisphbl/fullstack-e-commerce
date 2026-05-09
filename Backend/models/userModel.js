'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');
const ROLES = require('../constants/roles');

const ACCOUNT_STATUSES = ['active', 'suspended', 'pending'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [60, 'Name must be at most 60 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ACCOUNT_STATUSES,
      default: 'active',
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [
        function () {
          return this.isNew || this.isModified('password');
        },
        'Please confirm your password.',
      ],
      validate: {
        // Only runs on CREATE & SAVE — not on findOneAndUpdate
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords do not match.',
      },
    },
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: mongoose.Schema.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email is already indexed via unique:true — only add non-unique indexes here
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ name: 'text', email: 'text', phone: 'text' });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('orders', {
  ref: 'Order',
  foreignField: 'user',
  localField: '_id',
});

// ─── Pre-save middleware ──────────────────────────────────────────────────────
// Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Set passwordChangedAt
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Subtract 1 s to ensure token is always created after this timestamp
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Filter inactive users from all find queries
userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeInactive) {
    this.find({ active: { $ne: false } });
  }
  next();
});

userSchema.pre('save', function (next) {
  if (this.status === 'suspended') {
    this.active = false;
  } else if (this.status === 'active' || this.status === 'pending') {
    this.active = true;
  }
  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────
userSchema.methods.correctPassword = async function (candidate, stored) {
  return bcrypt.compare(candidate, stored);
};

userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTs = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < changedTs;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

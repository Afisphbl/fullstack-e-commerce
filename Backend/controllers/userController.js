'use strict';

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');
const MESSAGES = require('../constants/messages');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

const STAFF_ROLES = [ROLES.ADMIN];

const serializeUser = (user) => {
  const doc = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    ...doc,
    status: doc.status || (doc.active === false ? 'suspended' : 'active'),
    active: doc.active !== false,
  };
};

const buildAdminUserPayload = (body, { isCreate = false } = {}) => {
  const payload = {};
  const allowedFields = [
    'name',
    'email',
    'phone',
    'photo',
    'role',
    'status',
    'permissions',
  ];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (payload.permissions) {
    const perms = Array.isArray(payload.permissions)
      ? payload.permissions
      : String(payload.permissions).split(',').filter(Boolean);
    payload.permissions = perms
      .map((permission) => String(permission).trim())
      .filter(Boolean);
  }

  if (payload.role === ROLES.USER) {
    payload.permissions = [];
  }

  if (payload.status === 'suspended') {
    payload.active = false;
  } else if (payload.status === 'active' || payload.status === 'pending') {
    payload.active = true;
  }

  if (isCreate) {
    payload.password = body.password;
    payload.passwordConfirm = body.passwordConfirm;
  }

  return payload;
};

exports.getMe = (req, res, next) => {
  userService.setCurrentUserId(req);
  next();
};

exports.updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateMe(req.user._id, req.body);
  res.status(200).json({
    status: 'success',
    message: MESSAGES.UPDATED,
    data: { user },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await userService.deleteMe(req.user._id);
  res.status(204).json({ status: 'success', data: null });
});

exports.getWishlist = catchAsync(async (req, res) => {
  const wishlist = await userService.getWishlist(req.user._id);
  res.status(200).json({
    status: 'success',
    results: wishlist.length,
    data: { wishlist },
  });
});

exports.addToWishlist = catchAsync(async (req, res) => {
  const user = await userService.addToWishlist(req.user._id, req.body.productId);
  res.status(200).json({ status: 'success', data: { wishlist: user.wishlist } });
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
  const user = await userService.removeFromWishlist(req.user._id, req.params.productId);
  res.status(200).json({ status: 'success', data: { wishlist: user.wishlist } });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  const role = req.query.role;
  const status = req.query.status;
  const tab = req.query.tab;
  const search = req.query.search?.trim();

  if (role && role !== 'all') filter.role = role;
  if (status && status !== 'all') filter.status = status;

  if (tab === 'staff') {
    // Intersect the selected role with STAFF_ROLES
    let intersection = STAFF_ROLES;
    if (filter.role) {
      const existingRoles = Array.isArray(filter.role?.$in)
        ? filter.role.$in
        : [filter.role];
      intersection = STAFF_ROLES.filter((r) => existingRoles.includes(r));
    }
    filter.role = { $in: intersection };
  } else if (tab === 'users') {
    filter.role = ROLES.USER;
  }

  if (search) {
    // Escape regex metacharacters to prevent regex injection
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
      { phone: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [users, total, analytics, recentUsers] = await Promise.all([
    User.find(filter)
      .setOptions({ includeInactive: true })
      .select('+active')
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
    // Use aggregation for analytics instead of loading all users
    User.aggregate([
      { $match: {} },
      {
        $facet: {
          totalUsers: [{ $count: 'count' }],
          activeUsers: [
            { $match: { active: { $ne: false } } },
            { $count: 'count' },
          ],
          totalStaff: [
            { $match: { role: { $in: STAFF_ROLES } } },
            { $count: 'count' },
          ],
          newUsersThisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: 'count' },
          ],
        },
      },
    ]),
    // Fetch only recent users for events
    User.find({})
      .setOptions({ includeInactive: true })
      .select('+active')
      .sort('-updatedAt')
      .limit(5),
  ]);

  // Extract analytics counts from aggregation result
  const analyticsData = analytics[0];
  const analyticsMetrics = {
    totalUsers: analyticsData.totalUsers[0]?.count || 0,
    activeUsers: analyticsData.activeUsers[0]?.count || 0,
    totalStaff: analyticsData.totalStaff[0]?.count || 0,
    newUsersThisMonth: analyticsData.newUsersThisMonth[0]?.count || 0,
  };

  res.status(200).json({
    status: 'success',
    message: MESSAGES.FETCHED,
    results: users.length,
    total,
    page,
    limit,
    data: {
      data: users.map(serializeUser),
      analytics: analyticsMetrics,
      meta: {
        recentEvents: recentUsers.map((user) => {
          const serialized = serializeUser(user);
          return {
            id: serialized._id,
            type:
              serialized.status === 'suspended'
                ? 'account-suspended'
                : STAFF_ROLES.includes(serialized.role)
                  ? 'staff-update'
                  : 'user-update',
            title: `${serialized.name} was updated`,
            time: serialized.updatedAt,
          };
        }),
      },
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .setOptions({ includeInactive: true })
    .select('+active');

  if (!user) return next(new AppError(MESSAGES.NOT_FOUND, 404));

  res.status(200).json({
    status: 'success',
    message: MESSAGES.FETCHED,
    data: { data: serializeUser(user) },
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const payload = buildAdminUserPayload(req.body, { isCreate: true });
  const user = await User.create(payload);

  res.status(201).json({
    status: 'success',
    message: MESSAGES.CREATED,
    data: { data: serializeUser(user) },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .setOptions({ includeInactive: true })
    .select('+active');

  if (!user) return next(new AppError(MESSAGES.NOT_FOUND, 404));

  const payload = buildAdminUserPayload(req.body);
  Object.keys(payload).forEach((key) => {
    user[key] = payload[key];
  });

  await user.save();

  res.status(200).json({
    status: 'success',
    message: MESSAGES.UPDATED,
    data: { data: serializeUser(user) },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).setOptions({
    includeInactive: true,
  });

  if (!user) return next(new AppError(MESSAGES.NOT_FOUND, 404));

  await user.deleteOne();

  res.status(204).json({ status: 'success', data: null });
});

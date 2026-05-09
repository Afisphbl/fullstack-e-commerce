'use strict';

const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const MESSAGES = require('../constants/messages');

/**
 * handleFactory — reusable CRUD handler generator.
 *
 * Every function returns an Express middleware ready to be mounted directly
 * as a route handler. Controllers should ALWAYS use these instead of writing
 * custom CRUD logic.
 */

// ─── deleteOne ────────────────────────────────────────────────────────────────
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError(MESSAGES.NOT_FOUND, 404));

    res.status(204).json({ status: 'success', data: null });
  });

// ─── updateOne ────────────────────────────────────────────────────────────────
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return next(new AppError(MESSAGES.NOT_FOUND, 404));

    // Filter out internal or sensitive fields to prevent mass-assignment
    const forbiddenFields = ['_id', '__v', 'createdAt', 'updatedAt', 'password'];
    
    // Update document with request body, skipping forbidden fields
    Object.keys(req.body).forEach(key => {
      if (!forbiddenFields.includes(key)) {
        doc[key] = req.body[key];
      }
    });

    await doc.save();

    res.status(200).json({
      status: 'success',
      message: MESSAGES.UPDATED,
      data: { data: doc },
    });
  });

// ─── createOne ────────────────────────────────────────────────────────────────
exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      message: MESSAGES.CREATED,
      data: { data: doc },
    });
  });

// ─── getOne ───────────────────────────────────────────────────────────────────
/**
 * @param {import('mongoose').Model} Model
 * @param {object|null} populateOptions  - passed directly to .populate()
 */
exports.getOne = (Model, populateOptions = null) =>
  catchAsync(async (req, res, next) => {
    // Respect filterObj for ownership/access control (e.g., user can only see their own orders)
    const filter = { _id: req.params.id, ...(req.filterObj || {}) };
    
    let query = Model.findOne(filter);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError(MESSAGES.NOT_FOUND, 404));

    res.status(200).json({
      status: 'success',
      message: MESSAGES.FETCHED,
      data: { data: doc },
    });
  });

// ─── getAll ───────────────────────────────────────────────────────────────────
/**
 * Supports:
 *  - nested route filtering  (req.filterObj set by controller / middleware)
 *  - full APIFeatures chain  (filter, sort, limitFields, paginate)
 */
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // Allow nested routes to pre-set a filter (e.g. { product: productId })
    const filter = req.filterObj || {};

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Use .lean() for read-heavy list endpoints (no virtuals needed for lists)
    const docs = await features.query.lean({ virtuals: false });
    const total = await Model.countDocuments({
      ...filter,
      ...features._filter,
    });

    res.status(200).json({
      status: 'success',
      message: MESSAGES.FETCHED,
      results: docs.length,
      total,
      page: features._page,
      limit: features._limit,
      data: { data: docs },
    });
  });

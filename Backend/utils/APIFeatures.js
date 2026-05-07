'use strict';

const mongoose = require('mongoose');

/**
 * APIFeatures — applied to a Mongoose query before .exec() / await.
 *
 * Usage:
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const docs = await features.query;
 */
class APIFeatures {
  /**
   * @param {import('mongoose').Query} query  - Mongoose query object
   * @param {object} queryString             - req.query
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  filter() {
    const excluded = ['page', 'sort', 'limit', 'fields', 'search'];
    const queryObj = { ...this.queryString };
    excluded.forEach((f) => delete queryObj[f]);

    // Convert comparison operators: gte → $gte, lte → $lte, etc.
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne|in|nin)\b/g, (m) => `$${m}`);

    // ── Guard: remove fields whose schema path is an ObjectId ref but whose
    //    query value is not a valid ObjectId. This prevents CastErrors when a
    //    client sends a slug like ?category=electronics instead of an ID.
    //    The route-level `resolveCategoryFilter` middleware should handle slug
    //    resolution BEFORE this runs; this is a last-resort safety net.
    const parsed = JSON.parse(queryStr);
    const schema = this.query.model?.schema;
    if (schema) {
      for (const key of Object.keys(parsed)) {
        const schemaType = schema.path(key);
        if (
          schemaType &&
          schemaType.instance === 'ObjectId' &&
          parsed[key] &&
          typeof parsed[key] === 'string' &&
          !mongoose.isValidObjectId(parsed[key])
        ) {
          delete parsed[key];
        }
      }
    }
    
    // Add text search if requested
    if (this.queryString.search) {
      parsed.$text = { $search: this.queryString.search };
    }

    this._filter = parsed;
    this.query = this.query.find(parsed);
    return this;
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // ── Field Limiting ────────────────────────────────────────────────────────
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this._page = page;
    this._limit = limit;
    return this;
  }
}

module.exports = APIFeatures;

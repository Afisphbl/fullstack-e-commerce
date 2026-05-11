'use strict';

const FAQ = require('../models/faqModel');
const factory = require('./handleFactory');

// For public access, active only
exports.aliasActiveFAQs = (req, res, next) => {
  req.query.isActive = 'true';
  req.query.sort = 'order';
  next();
};

exports.getAllFAQs = factory.getAll(FAQ);
exports.getFAQ = factory.getOne(FAQ);
exports.createFAQ = factory.createOne(FAQ);
exports.updateFAQ = factory.updateOne(FAQ);
exports.deleteFAQ = factory.deleteOne(FAQ);

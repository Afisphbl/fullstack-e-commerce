'use strict';

const Section = require('../models/sectionModel');
const factory = require('./handleFactory');

// For public access, usually we want sorted by order and only active
exports.aliasActiveSections = (req, res, next) => {
  req.query.isActive = 'true';
  req.query.sort = 'order';
  next();
};

exports.getAllSections = factory.getAll(Section);
exports.getSection = factory.getOne(Section);
exports.createSection = factory.createOne(Section);
exports.updateSection = factory.updateOne(Section);
exports.deleteSection = factory.deleteOne(Section);

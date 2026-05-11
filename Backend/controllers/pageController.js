'use strict';

const Page = require('../models/pageModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const MESSAGES = require('../constants/messages');

exports.getAllPages = factory.getAll(Page);
exports.getPage = factory.getOne(Page);
exports.createPage = factory.createOne(Page);
exports.updatePage = factory.updateOne(Page);
exports.deletePage = factory.deleteOne(Page);

exports.getPageBySlug = catchAsync(async (req, res, next) => {
  const page = await Page.findOne({ slug: req.params.slug, isPublished: true });

  if (!page) {
    return next(new AppError('No published page found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { data: page },
  });
});

'use strict';

const Setting = require('../models/settingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const MESSAGES = require('../constants/messages');

exports.getSettings = catchAsync(async (req, res, next) => {
  let settings = await Setting.findOne();
  
  if (!settings) {
    // If no settings exist yet, create default settings
    settings = await Setting.create({});
  }

  res.status(200).json({
    status: 'success',
    data: { data: settings },
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  let settings = await Setting.findOne();
  
  if (!settings) {
    settings = await Setting.create({});
  }

  // Find the single document and update it
  const updatedSettings = await Setting.findByIdAndUpdate(
    settings._id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    message: MESSAGES.UPDATED,
    data: { data: updatedSettings },
  });
});

'use strict';

const cloudinary = require('cloudinary').v2;
const { cloudinary: config } = require('../config/env');

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.apiKey,
  api_secret: config.apiSecret,
});

module.exports = cloudinary;

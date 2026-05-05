'use strict';

const path = require('path');
const dotenv = require('dotenv');

const envFile = path.resolve(__dirname, '..', 'config.env');
const result = dotenv.config({ path: envFile });

if (result.error) {
  throw new Error(`Failed to load env file at ${envFile}: ${result.error.message}`);
}

const required = [
  'PORT',
  'DATABASE_HOST',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN_DAYS',
  'NODE_ENV',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: `${process.env.JWT_EXPIRES_IN_DAYS}d`,
  adminSecret: process.env.ADMIN_SECRET,
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

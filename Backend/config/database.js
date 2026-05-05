'use strict';

const mongoose = require('mongoose');
const logger = require('../logs/logger');

const connectDB = async () => {
  const uri = process.env.DATABASE_HOST.replace(
    '<db_password>',
    process.env.DB_PASSWORD
  );

  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    family: 4,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () =>
  logger.warn('MongoDB disconnected — retrying…')
);

mongoose.connection.on('error', (err) =>
  logger.error(`MongoDB error: ${err.message}`)
);

module.exports = connectDB;

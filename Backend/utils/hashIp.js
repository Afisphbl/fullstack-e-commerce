'use strict';

const crypto = require('crypto');
const config = require('../config/env');

/**
 * Hash an IP address using SHA-256 with a server-side salt for privacy.
 * This creates a one-way hash that cannot be reversed to obtain the original IP.
 * 
 * @param {string} ipAddress - The IP address to hash
 * @returns {string} - The hashed IP address (hex string)
 */
const hashIpAddress = (ipAddress) => {
  if (!ipAddress) return null;

  // Use JWT_SECRET as salt (already required and secure)
  const salt = config.jwtSecret;
  
  // Create SHA-256 hash with salt
  const hash = crypto
    .createHmac('sha256', salt)
    .update(ipAddress)
    .digest('hex');
  
  return hash;
};

/**
 * Extract IP address from request object, handling various proxy scenarios.
 * 
 * @param {object} req - Express request object
 * @returns {string} - The client's IP address
 */
const extractIpAddress = (req) => {
  // Check X-Forwarded-For header (set by proxies/load balancers)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one (client IP)
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback to direct connection IP
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
};

module.exports = {
  hashIpAddress,
  extractIpAddress,
};

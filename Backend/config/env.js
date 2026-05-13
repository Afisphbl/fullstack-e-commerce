"use strict";

require("dotenv").config();

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "gmail";

const required = [
  "PORT",
  "DATABASE_HOST",
  "DB_PASSWORD",
  "JWT_SECRET",
  "JWT_EXPIRES_IN_DAYS",
  "NODE_ENV",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_FROM",
  "OWNER_EMAIL",
];

// Add provider-specific required variables
if (EMAIL_PROVIDER === "gmail") {
  required.push("GMAIL_USER", "GMAIL_APP_PASSWORD");
} else if (EMAIL_PROVIDER === "resend") {
  required.push("RESEND_API_KEY");
}

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: `${process.env.JWT_EXPIRES_IN_DAYS}d`,
  adminSecret: process.env.ADMIN_SECRET,
  email: {
    username: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
    from: process.env.EMAIL_FROM,
    clientUrl:
      process.env.PROD_CLIENT_URL ||
      (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim(),
    ownerEmail: process.env.OWNER_EMAIL,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

'use strict';

/**
 * Migration Script: Convert raw IP addresses to hashed IPs
 * 
 * This script migrates existing messages from the old schema (raw ipAddress)
 * to the new schema (hashedIp + expiresAt).
 * 
 * Usage:
 *   node utils/migrateMessages.js
 */

const mongoose = require('mongoose');
const Message = require('../models/messageModel');
const { hashIpAddress } = require('./hashIp');
const config = require('../config/env');

const migrateMessages = async () => {
  try {
    console.log('🔄 Starting message migration...\n');

    // Connect to database
    const DB = config.env === 'production'
      ? process.env.DATABASE_HOST.replace('<db_password>', process.env.DB_PASSWORD)
      : process.env.DATABASE_HOST;

    await mongoose.connect(DB);
    console.log('✅ Connected to database\n');

    // Find all messages with old ipAddress field
    const messages = await Message.find({ ipAddress: { $exists: true } }).select('+ipAddress');
    
    if (messages.length === 0) {
      console.log('✅ No messages to migrate. All messages are already using the new schema.\n');
      process.exit(0);
    }

    console.log(`📊 Found ${messages.length} messages to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const msg of messages) {
      try {
        // Hash the IP address if it exists
        if (msg.ipAddress) {
          msg.hashedIp = hashIpAddress(msg.ipAddress);
          
          // Set expiration date (90 days from creation)
          if (!msg.expiresAt) {
            const createdAt = msg.createdAt || new Date();
            msg.expiresAt = new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);
          }
          
          // Remove old ipAddress field
          msg.ipAddress = undefined;
          
          await msg.save({ validateBeforeSave: false });
          migrated++;
          
          if (migrated % 100 === 0) {
            console.log(`   Migrated ${migrated} messages...`);
          }
        } else {
          skipped++;
        }
      } catch (error) {
        errors++;
        console.error(`   ❌ Error migrating message ${msg._id}: ${error.message}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped (no IP): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('\n✨ Migration complete!\n');

    // Verify migration
    const remainingOldFormat = await Message.countDocuments({ ipAddress: { $exists: true } });
    const newFormat = await Message.countDocuments({ hashedIp: { $exists: true } });
    
    console.log('🔍 Verification:');
    console.log(`   Messages with old format (ipAddress): ${remainingOldFormat}`);
    console.log(`   Messages with new format (hashedIp): ${newFormat}`);
    
    if (remainingOldFormat === 0) {
      console.log('\n✅ All messages successfully migrated!\n');
    } else {
      console.log('\n⚠️  Some messages still have old format. Run migration again.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateMessages();
}

module.exports = migrateMessages;

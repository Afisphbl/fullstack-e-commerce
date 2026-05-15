'use strict';

/**
 * Multilingual Data Migration Script
 * 
 * Transforms existing single-language data to multilingual format.
 * Supports: Products, Categories, and Settings models.
 * 
 * IMPORTANT: Backup your database before running this script!
 * 
 * Usage:
 *   node migrations/001-multilingual-migration.js
 */

require('../config/env');
const mongoose = require('mongoose');
const { migrateToMultilingual } = require('../utils/multilingualSchema');

// Import models (they will use the NEW multilingual schema)
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Specification = require('../models/specificationModel');
const Order = require('../models/orderModel');
const GeneralSettings = require('../models/generalSettingsModel');
const HeroSettings = require('../models/heroSettingsModel');
const AboutSettings = require('../models/aboutSettingsModel');
const ContactSettings = require('../models/contactSettingsModel');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Migrate Products
 */
const migrateProducts = async () => {
  console.log('\n📦 Migrating Products...');
  
  try {
    // Fetch all products using lean() to get plain objects
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      // Check if already migrated
      if (typeof product.name === 'object' && product.name.am && product.name.en && product.name.om) {
        skippedCount++;
        continue;
      }
      
      // Prepare multilingual data
      const updateData = {};
      
      if (typeof product.name === 'string') {
        updateData.name = migrateToMultilingual(product.name);
      }
      
      if (typeof product.description === 'string') {
        updateData.description = migrateToMultilingual(product.description);
      }
      
      if (product.shortDescription && typeof product.shortDescription === 'string') {
        updateData.shortDescription = migrateToMultilingual(product.shortDescription);
      }
      
      // Update the product
      await Product.updateOne(
        { _id: product._id },
        { $set: updateData },
        { runValidators: false } // Skip validation during migration
      );
      
      migratedCount++;
    }
    
    console.log(`✅ Products: ${migratedCount} migrated, ${skippedCount} already multilingual`);
  } catch (error) {
    console.error('❌ Product migration error:', error);
    throw error;
  }
};

/**
 * Migrate Categories
 */
const migrateCategories = async () => {
  console.log('\n📁 Migrating Categories...');
  
  try {
    const categories = await Category.find({}).lean();
    console.log(`Found ${categories.length} categories`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const category of categories) {
      // Check if already migrated
      if (typeof category.name === 'object' && category.name.am && category.name.en && category.name.om) {
        skippedCount++;
        continue;
      }
      
      const updateData = {};
      
      if (typeof category.name === 'string') {
        updateData.name = migrateToMultilingual(category.name);
      }
      
      if (category.description && typeof category.description === 'string') {
        updateData.description = migrateToMultilingual(category.description);
      }
      
      await Category.updateOne(
        { _id: category._id },
        { $set: updateData },
        { runValidators: false }
      );
      
      migratedCount++;
    }
    
    console.log(`✅ Categories: ${migratedCount} migrated, ${skippedCount} already multilingual`);
  } catch (error) {
    console.error('❌ Category migration error:', error);
    throw error;
  }
};

/**
 * Migrate General Settings
 */
const migrateGeneralSettings = async () => {
  console.log('\n⚙️  Migrating General Settings...');
  
  try {
    const settings = await GeneralSettings.findOne().lean();
    
    if (!settings) {
      console.log('⚠️  No general settings found, skipping');
      return;
    }
    
    // Check if already migrated
    if (typeof settings.companyName === 'object' && settings.companyName.am) {
      console.log('✅ General Settings: Already multilingual');
      return;
    }
    
    const updateData = {};
    
    if (typeof settings.companyName === 'string') {
      updateData.companyName = migrateToMultilingual(settings.companyName);
    }
    
    if (typeof settings.tagline === 'string') {
      updateData.tagline = migrateToMultilingual(settings.tagline);
    }
    
    if (typeof settings.description === 'string') {
      updateData.description = migrateToMultilingual(settings.description);
    }
    
    await GeneralSettings.updateOne(
      { _id: settings._id },
      { $set: updateData },
      { runValidators: false }
    );
    
    console.log('✅ General Settings: Migrated');
  } catch (error) {
    console.error('❌ General Settings migration error:', error);
    throw error;
  }
};

/**
 * Migrate Hero Settings
 */
const migrateHeroSettings = async () => {
  console.log('\n🎨 Migrating Hero Settings...');
  
  try {
    const settings = await HeroSettings.findOne().lean();
    
    if (!settings) {
      console.log('⚠️  No hero settings found, skipping');
      return;
    }
    
    // Check if already migrated
    if (typeof settings.heroTitle === 'object' && settings.heroTitle.am) {
      console.log('✅ Hero Settings: Already multilingual');
      return;
    }
    
    const updateData = {};
    
    if (typeof settings.heroEyebrow === 'string') {
      updateData.heroEyebrow = migrateToMultilingual(settings.heroEyebrow);
    }
    
    if (typeof settings.heroTitle === 'string') {
      updateData.heroTitle = migrateToMultilingual(settings.heroTitle);
    }
    
    if (typeof settings.heroHighlight === 'string') {
      updateData.heroHighlight = migrateToMultilingual(settings.heroHighlight);
    }
    
    if (typeof settings.heroSubtitle === 'string') {
      updateData.heroSubtitle = migrateToMultilingual(settings.heroSubtitle);
    }
    
    if (typeof settings.heroCtaText === 'string') {
      updateData.heroCtaText = migrateToMultilingual(settings.heroCtaText);
    }
    
    // Migrate hero slides
    if (settings.heroSlides && Array.isArray(settings.heroSlides)) {
      updateData.heroSlides = settings.heroSlides.map(slide => ({
        image: slide.image,
        title: typeof slide.title === 'string' ? migrateToMultilingual(slide.title) : slide.title,
        subtitle: typeof slide.subtitle === 'string' ? migrateToMultilingual(slide.subtitle) : slide.subtitle
      }));
    }
    
    await HeroSettings.updateOne(
      { _id: settings._id },
      { $set: updateData },
      { runValidators: false }
    );
    
    console.log('✅ Hero Settings: Migrated');
  } catch (error) {
    console.error('❌ Hero Settings migration error:', error);
    throw error;
  }
};

/**
 * Migrate About Settings
 */
const migrateAboutSettings = async () => {
  console.log('\n📄 Migrating About Settings...');
  
  try {
    const settings = await AboutSettings.findOne().lean();
    
    if (!settings) {
      console.log('⚠️  No about settings found, skipping');
      return;
    }
    
    // Check if already migrated
    if (typeof settings.aboutTitle === 'object' && settings.aboutTitle.am) {
      console.log('✅ About Settings: Already multilingual');
      return;
    }
    
    const updateData = {};
    
    if (typeof settings.aboutEyebrow === 'string') {
      updateData.aboutEyebrow = migrateToMultilingual(settings.aboutEyebrow);
    }
    
    if (typeof settings.aboutTitle === 'string') {
      updateData.aboutTitle = migrateToMultilingual(settings.aboutTitle);
    }
    
    if (typeof settings.aboutHighlight === 'string') {
      updateData.aboutHighlight = migrateToMultilingual(settings.aboutHighlight);
    }
    
    if (typeof settings.aboutIntro === 'string') {
      updateData.aboutIntro = migrateToMultilingual(settings.aboutIntro);
    }
    
    // Migrate about stats
    if (settings.aboutStats && Array.isArray(settings.aboutStats)) {
      updateData.aboutStats = settings.aboutStats.map(stat => ({
        value: typeof stat.value === 'string' ? migrateToMultilingual(stat.value) : stat.value,
        label: typeof stat.label === 'string' ? migrateToMultilingual(stat.label) : stat.label
      }));
    }
    
    // Migrate about values
    if (settings.aboutValues && Array.isArray(settings.aboutValues)) {
      updateData.aboutValues = settings.aboutValues.map(value => ({
        title: typeof value.title === 'string' ? migrateToMultilingual(value.title) : value.title,
        desc: typeof value.desc === 'string' ? migrateToMultilingual(value.desc) : value.desc
      }));
    }
    
    await AboutSettings.updateOne(
      { _id: settings._id },
      { $set: updateData },
      { runValidators: false }
    );
    
    console.log('✅ About Settings: Migrated');
  } catch (error) {
    console.error('❌ About Settings migration error:', error);
    throw error;
  }
};

/**
 * Migrate Contact Settings
 */
const migrateContactSettings = async () => {
  console.log('\n📞 Migrating Contact Settings...');
  
  try {
    const settings = await ContactSettings.findOne().lean();
    
    if (!settings) {
      console.log('⚠️  No contact settings found, skipping');
      return;
    }
    
    // Check if already migrated
    if (typeof settings.contactAddress === 'object' && settings.contactAddress.am) {
      console.log('✅ Contact Settings: Already multilingual');
      return;
    }
    
    const updateData = {};
    
    if (typeof settings.contactAddress === 'string') {
      updateData.contactAddress = migrateToMultilingual(settings.contactAddress);
    }
    
    if (typeof settings.workingHours === 'string') {
      updateData.workingHours = migrateToMultilingual(settings.workingHours);
    }
    
    await ContactSettings.updateOne(
      { _id: settings._id },
      { $set: updateData },
      { runValidators: false }
    );
    
    console.log('✅ Contact Settings: Migrated');
  } catch (error) {
    console.error('❌ Contact Settings migration error:', error);
    throw error;
  }
};

/**
 * Migrate Specifications
 */
const migrateSpecifications = async () => {
  console.log('\n📋 Migrating Specifications...');
  
  try {
    const specifications = await Specification.find({}).lean();
    console.log(`Found ${specifications.length} specifications`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const spec of specifications) {
      // Check if already migrated
      if (spec.details && spec.details.length > 0) {
        const firstDetail = spec.details[0];
        if (typeof firstDetail.group === 'object' && firstDetail.group.am) {
          skippedCount++;
          continue;
        }
      }
      
      const updateData = {};
      
      if (spec.details && Array.isArray(spec.details)) {
        updateData.details = spec.details.map(detail => ({
          group: typeof detail.group === 'string' 
            ? migrateToMultilingual(detail.group) 
            : detail.group,
          specs: detail.specs.map(s => ({
            name: typeof s.name === 'string' 
              ? migrateToMultilingual(s.name) 
              : s.name,
            value: s.value // Keep value as-is (technical data)
          }))
        }));
      }
      
      await Specification.updateOne(
        { _id: spec._id },
        { $set: updateData },
        { runValidators: false }
      );
      
      migratedCount++;
    }
    
    console.log(`✅ Specifications: ${migratedCount} migrated, ${skippedCount} already multilingual`);
  } catch (error) {
    console.error('❌ Specification migration error:', error);
    throw error;
  }
};

/**
 * Migrate Orders (orderItems names)
 */
const migrateOrders = async () => {
  console.log('\n📦 Migrating Orders...');
  
  try {
    const orders = await Order.find({}).lean();
    console.log(`Found ${orders.length} orders`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const order of orders) {
      // Check if already migrated
      if (order.orderItems && order.orderItems.length > 0) {
        const firstItem = order.orderItems[0];
        if (typeof firstItem.name === 'object' && firstItem.name.am) {
          skippedCount++;
          continue;
        }
      }
      
      const updateData = {};
      
      if (order.orderItems && Array.isArray(order.orderItems)) {
        updateData.orderItems = order.orderItems.map(item => ({
          ...item,
          name: typeof item.name === 'string' 
            ? migrateToMultilingual(item.name) 
            : item.name
        }));
      }
      
      await Order.updateOne(
        { _id: order._id },
        { $set: updateData },
        { runValidators: false }
      );
      
      migratedCount++;
    }
    
    console.log(`✅ Orders: ${migratedCount} migrated, ${skippedCount} already multilingual`);
  } catch (error) {
    console.error('❌ Order migration error:', error);
    throw error;
  }
};

/**
 * Main migration function
 */
const runMigration = async () => {
  console.log('🚀 Starting Multilingual Data Migration');
  console.log('=====================================\n');
  
  try {
    await connectDB();
    
    // Run migrations in sequence
    await migrateProducts();
    await migrateCategories();
    await migrateSpecifications();
    await migrateOrders();
    await migrateGeneralSettings();
    await migrateHeroSettings();
    await migrateAboutSettings();
    await migrateContactSettings();
    
    console.log('\n=====================================');
    console.log('✅ Migration completed successfully!');
    console.log('=====================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
runMigration();

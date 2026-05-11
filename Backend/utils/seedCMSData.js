'use strict';

require('../config/env');
const mongoose = require('mongoose');
const connectDB = require('../config/database');

// Import models
const SiteSettings = require('../models/siteSettingsModel');
const HeroSlide = require('../models/heroSlideModel');
const Feature = require('../models/featureModel');
const PageContent = require('../models/pageContentModel');
const FAQ = require('../models/faqModel');
const SocialLink = require('../models/socialLinkModel');
const SEOSettings = require('../models/seoSettingsModel');
const User = require('../models/userModel');

// Seed data
const seedCMSData = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting CMS data seeding...\n');

    // Get an admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})\n`);

    // 1. Site Settings (Singleton)
    console.log('📝 Seeding Site Settings...');
    const siteSettings = await SiteSettings.findOne();
    if (!siteSettings) {
      await SiteSettings.create({
        siteName: 'VOLTEDGE',
        siteTagline: 'Your premium destination for cutting-edge electronics. Experience the future today.',
        contactEmail: 'support@voltedge.com',
        contactPhone: '+1 (555) 123-4567',
        contactAddress: 'San Francisco, CA',
        mapLatitude: 37.7749,
        mapLongitude: -122.4194,
        mapEmbedUrl: 'https://www.google.com/maps?q=37.7749,-122.4194&output=embed',
        workingHours: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 8:00 PM',
          saturday: '10:00 AM - 6:00 PM',
          sunday: '11:00 AM - 4:00 PM',
        },
        footerText: 'Your premium destination for cutting-edge electronics. Experience the future today.',
        copyrightText: '© 2026 VoltEdge. All rights reserved.',
        updatedBy: adminUser._id,
      });
      console.log('✅ Site Settings created\n');
    } else {
      console.log('⚠️  Site Settings already exist\n');
    }

    // 2. Hero Slides
    console.log('📝 Seeding Hero Slides...');
    const heroSlidesCount = await HeroSlide.countDocuments();
    if (heroSlidesCount === 0) {
      await HeroSlide.insertMany([
        {
          title: 'Powerful Laptops',
          subtitle: 'Built for creators and pros',
          image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
          buttonText: 'Shop Now',
          buttonLink: '/shop',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          title: 'Smart Flagship Phones',
          subtitle: 'Performance meets elegance',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
          buttonText: 'Shop Now',
          buttonLink: '/shop',
          order: 1,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          title: 'Ultra-Clear Displays',
          subtitle: 'Visuals that redefine detail',
          image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200',
          buttonText: 'Shop Now',
          buttonLink: '/shop',
          order: 2,
          isActive: true,
          createdBy: adminUser._id,
        },
      ]);
      console.log('✅ Hero Slides created (3)\n');
    } else {
      console.log(`⚠️  Hero Slides already exist (${heroSlidesCount})\n`);
    }

    // 3. Features
    console.log('📝 Seeding Features...');
    const featuresCount = await Feature.countDocuments();
    if (featuresCount === 0) {
      await Feature.insertMany([
        {
          icon: 'Truck',
          title: 'Free Shipping',
          description: 'On orders over $100',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          icon: 'Shield',
          title: '2 Year Warranty',
          description: 'Extended protection',
          order: 1,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          icon: 'Zap',
          title: 'Fast Support',
          description: '24/7 expert help',
          order: 2,
          isActive: true,
          createdBy: adminUser._id,
        },
      ]);
      console.log('✅ Features created (3)\n');
    } else {
      console.log(`⚠️  Features already exist (${featuresCount})\n`);
    }

    // 4. Page Content - Home
    console.log('📝 Seeding Page Content (Home)...');
    const homeContent = await PageContent.findOne({ page: 'home' });
    if (!homeContent) {
      await PageContent.create({
        page: 'home',
        sections: [
          {
            key: 'hero',
            title: 'Experience The Future Of Technology',
            subtitle: 'NEXT-GEN ELECTRONICS',
            description: 'Discover cutting-edge electronics with unmatched performance. From AI-powered laptops to quantum displays — we bring tomorrow\'s tech today.',
            buttonText: 'Shop Now',
            buttonLink: '/shop',
          },
          {
            key: 'cta',
            title: 'Ready to Upgrade?',
            description: 'Join thousands of tech enthusiasts who trust VoltEdge for the latest in consumer electronics.',
            buttonText: 'Explore Collection',
            buttonLink: '/shop',
          },
        ],
        updatedBy: adminUser._id,
      });
      console.log('✅ Home Page Content created\n');
    } else {
      console.log('⚠️  Home Page Content already exists\n');
    }

    // 5. Page Content - About
    console.log('📝 Seeding Page Content (About)...');
    const aboutContent = await PageContent.findOne({ page: 'about' });
    if (!aboutContent) {
      await PageContent.create({
        page: 'about',
        sections: [
          {
            key: 'hero',
            title: 'About VoltEdge',
            subtitle: 'WHO WE ARE',
            description: 'We\'re on a mission to make cutting-edge technology accessible to everyone. Founded in 2020, VoltEdge has grown from a small startup to a global electronics destination trusted by millions.',
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
          },
          {
            key: 'stats',
            title: 'Our Impact',
            items: [
              { icon: 'Users', value: '2M+', label: 'Happy Customers', order: 0 },
              { icon: 'Globe', value: '50+', label: 'Countries', order: 1 },
              { icon: 'Zap', value: '10K+', label: 'Products', order: 2 },
              { icon: 'Award', value: '99%', label: 'Satisfaction', order: 3 },
            ],
          },
          {
            key: 'values',
            title: 'Our Core Values',
            description: 'The principles that shape every product, partnership, and customer experience at VoltEdge.',
            items: [
              {
                icon: 'ShieldCheck',
                title: 'Trust First',
                description: 'Transparent pricing, verified products, and secure transactions.',
                order: 0,
              },
              {
                icon: 'Lightbulb',
                title: 'Innovate Daily',
                description: 'We constantly explore technologies that improve everyday life.',
                order: 1,
              },
              {
                icon: 'Handshake',
                title: 'Customer Obsessed',
                description: 'Every decision starts with customer value and usability.',
                order: 2,
              },
              {
                icon: 'Rocket',
                title: 'Move Fast',
                description: 'We ship better experiences quickly and iterate with purpose.',
                order: 3,
              },
            ],
          },
          {
            key: 'pillars',
            title: 'Strategic Pillars',
            items: [
              {
                title: 'Curated Selection',
                description: 'Only high-value devices with practical, real-world performance.',
                order: 0,
              },
              {
                title: 'Premium Support',
                description: 'Fast and informed pre-sale and post-sale support for every customer.',
                order: 1,
              },
              {
                title: 'Reliable Fulfillment',
                description: 'Strong logistics operations with dependable and traceable delivery.',
                order: 2,
              },
            ],
          },
        ],
        updatedBy: adminUser._id,
      });
      console.log('✅ About Page Content created\n');
    } else {
      console.log('⚠️  About Page Content already exists\n');
    }

    // 6. FAQs
    console.log('📝 Seeding FAQs...');
    const faqsCount = await FAQ.countDocuments();
    if (faqsCount === 0) {
      await FAQ.insertMany([
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day hassle-free return policy for all products. Items must be in original condition with all accessories included. Refunds are processed within 5-7 business days.',
          category: 'Returns',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Same-day delivery is available in select metro areas for orders placed before 2 PM.',
          category: 'Shipping',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          question: 'Do you offer international shipping?',
          answer: 'Yes! We ship to over 50 countries worldwide. International shipping typically takes 7-14 business days depending on the destination. Customs duties may apply.',
          category: 'Shipping',
          order: 1,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, and cryptocurrency (BTC, ETH). We also offer buy-now-pay-later through Klarna.',
          category: 'Payment',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          question: 'How do I track my order?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in real-time from your account dashboard under \'Order History\'.',
          category: 'Orders',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          question: 'Do you offer warranty on products?',
          answer: 'All products come with a minimum 1-year manufacturer warranty. We also offer extended warranty plans (2-year and 3-year) at checkout for additional coverage.',
          category: 'Warranty',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          question: 'Can I cancel or modify my order?',
          answer: 'Orders can be cancelled or modified within 1 hour of placement. After that, if the order hasn\'t shipped yet, please contact our support team and we\'ll do our best to accommodate changes.',
          category: 'Orders',
          order: 1,
          isActive: true,
          createdBy: adminUser._id,
        },
        {
          question: 'Do you price match?',
          answer: 'Yes! We offer price matching against major authorized retailers. If you find a lower price within 14 days of purchase, we\'ll refund the difference. Terms and conditions apply.',
          category: 'Pricing',
          order: 0,
          isActive: true,
          createdBy: adminUser._id,
        },
      ]);
      console.log('✅ FAQs created (8)\n');
    } else {
      console.log(`⚠️  FAQs already exist (${faqsCount})\n`);
    }

    // 7. Social Links
    console.log('📝 Seeding Social Links...');
    const socialLinksCount = await SocialLink.countDocuments();
    if (socialLinksCount === 0) {
      await SocialLink.insertMany([
        {
          platform: 'facebook',
          url: 'https://facebook.com/voltedge',
          icon: 'Facebook',
          order: 0,
          isActive: true,
        },
        {
          platform: 'instagram',
          url: 'https://instagram.com/voltedge',
          icon: 'Instagram',
          order: 1,
          isActive: true,
        },
        {
          platform: 'twitter',
          url: 'https://twitter.com/voltedge',
          icon: 'Twitter',
          order: 2,
          isActive: true,
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/company/voltedge',
          icon: 'Linkedin',
          order: 3,
          isActive: true,
        },
      ]);
      console.log('✅ Social Links created (4)\n');
    } else {
      console.log(`⚠️  Social Links already exist (${socialLinksCount})\n`);
    }

    // 8. SEO Settings
    console.log('📝 Seeding SEO Settings...');
    const seoSettingsCount = await SEOSettings.countDocuments();
    if (seoSettingsCount === 0) {
      await SEOSettings.insertMany([
        {
          page: 'home',
          metaTitle: 'VoltEdge - Premium Electronics Store',
          metaDescription: 'Discover cutting-edge electronics with unmatched performance. Shop laptops, phones, displays and more at VoltEdge.',
          metaKeywords: ['electronics', 'laptops', 'phones', 'displays', 'tech', 'gadgets'],
          ogTitle: 'VoltEdge - Experience The Future Of Technology',
          ogDescription: 'Your premium destination for cutting-edge electronics. Shop the latest tech today.',
          twitterCard: 'summary_large_image',
          updatedBy: adminUser._id,
        },
        {
          page: 'shop',
          metaTitle: 'Shop Electronics | VoltEdge',
          metaDescription: 'Browse our collection of premium electronics. Find laptops, phones, displays and more with fast shipping and warranty.',
          metaKeywords: ['shop electronics', 'buy laptops', 'buy phones', 'tech store'],
          ogTitle: 'Shop Premium Electronics | VoltEdge',
          ogDescription: 'Browse our collection of cutting-edge electronics with fast shipping.',
          twitterCard: 'summary_large_image',
          updatedBy: adminUser._id,
        },
        {
          page: 'about',
          metaTitle: 'About Us | VoltEdge',
          metaDescription: 'Learn about VoltEdge - your trusted destination for cutting-edge electronics since 2020. Serving 2M+ customers in 50+ countries.',
          metaKeywords: ['about voltedge', 'electronics company', 'tech store'],
          ogTitle: 'About VoltEdge - Our Story',
          ogDescription: 'Making cutting-edge technology accessible to everyone since 2020.',
          twitterCard: 'summary_large_image',
          updatedBy: adminUser._id,
        },
        {
          page: 'contact',
          metaTitle: 'Contact Us | VoltEdge',
          metaDescription: 'Get in touch with VoltEdge. We\'re here to help with your questions, orders, and support needs.',
          metaKeywords: ['contact voltedge', 'customer support', 'help'],
          ogTitle: 'Contact VoltEdge Support',
          ogDescription: 'Have questions? Our team is ready to help 24/7.',
          twitterCard: 'summary_large_image',
          updatedBy: adminUser._id,
        },
        {
          page: 'faq',
          metaTitle: 'FAQ | VoltEdge',
          metaDescription: 'Find answers to frequently asked questions about shipping, returns, payments, warranties and more.',
          metaKeywords: ['faq', 'help', 'questions', 'support'],
          ogTitle: 'Frequently Asked Questions | VoltEdge',
          ogDescription: 'Get quick answers to common questions about our products and services.',
          twitterCard: 'summary_large_image',
          updatedBy: adminUser._id,
        },
      ]);
      console.log('✅ SEO Settings created (5)\n');
    } else {
      console.log(`⚠️  SEO Settings already exist (${seoSettingsCount})\n`);
    }

    console.log('✅ CMS data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Site Settings: 1`);
    console.log(`   - Hero Slides: ${await HeroSlide.countDocuments()}`);
    console.log(`   - Features: ${await Feature.countDocuments()}`);
    console.log(`   - Page Contents: ${await PageContent.countDocuments()}`);
    console.log(`   - FAQs: ${await FAQ.countDocuments()}`);
    console.log(`   - Social Links: ${await SocialLink.countDocuments()}`);
    console.log(`   - SEO Settings: ${await SEOSettings.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding CMS data:', error);
    process.exit(1);
  }
};

// Run seeder
seedCMSData();

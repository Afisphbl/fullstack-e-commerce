'use strict';

const User = require('../models/userModel');
const Product = require('../models/productModel');

// ─── Get wishlist analytics ───────────────────────────────────────────────────
const getWishlistAnalytics = async () => {
  // Aggregate wishlist data across all users
  const analytics = await User.aggregate([
    // Unwind the wishlist array to get individual product references
    { $unwind: '$wishlist' },
    // Group by product to count how many users have each product in wishlist
    {
      $group: {
        _id: '$wishlist',
        count: { $sum: 1 },
      },
    },
    // Sort by count descending to get most wishlisted products
    { $sort: { count: -1 } },
    // Limit to top 10
    { $limit: 10 },
    // Lookup product details
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    // Unwind product array
    { $unwind: '$product' },
    // Project the fields we need
    {
      $project: {
        _id: 0,
        productId: '$_id',
        productName: '$product.name',
        productSlug: '$product.slug',
        productImage: '$product.imageCover',
        productPrice: '$product.price',
        productCategory: '$product.category',
        wishlistCount: '$count',
      },
    },
  ]);

  // Get total wishlist stats
  const totalStats = await User.aggregate([
    {
      $project: {
        wishlistSize: { $size: { $ifNull: ['$wishlist', []] } },
      },
    },
    {
      $group: {
        _id: null,
        totalWishlists: { $sum: 1 },
        totalWishlistItems: { $sum: '$wishlistSize' },
        avgWishlistSize: { $avg: '$wishlistSize' },
        maxWishlistSize: { $max: '$wishlistSize' },
      },
    },
  ]);

  // Get users with most items in wishlist
  const topWishlisters = await User.aggregate([
    {
      $project: {
        name: 1,
        email: 1,
        wishlistSize: { $size: { $ifNull: ['$wishlist', []] } },
      },
    },
    { $match: { wishlistSize: { $gt: 0 } } },
    { $sort: { wishlistSize: -1 } },
    { $limit: 5 },
  ]);

  return {
    topWishlistedProducts: analytics,
    stats: totalStats[0] || {
      totalWishlists: 0,
      totalWishlistItems: 0,
      avgWishlistSize: 0,
      maxWishlistSize: 0,
    },
    topWishlisters,
  };
};

module.exports = {
  getWishlistAnalytics,
};

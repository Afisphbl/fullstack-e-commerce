'use strict';

const catchAsync = require('../utils/catchAsync');
const wishlistService = require('../services/wishlistService');

// ── Get wishlist analytics (admin only) ───────────────────────────────────────
exports.getWishlistAnalytics = catchAsync(async (req, res) => {
  const analytics = await wishlistService.getWishlistAnalytics();
  
  res.status(200).json({
    status: 'success',
    data: { analytics },
  });
});

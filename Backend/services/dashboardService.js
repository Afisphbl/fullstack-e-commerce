"use strict";

const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const wishlistService = require("./wishlistService");

const getDashboardStats = async () => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPreviousMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCustomers,
    totalCategories,
    orderStats,
    revenueByMonth,
    salesByCategory,
    topSellingProducts,
    recentOrders,
    currentMonthStats,
    previousMonthStats,
    wishlistAnalytics,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Category.countDocuments(),

    // Orders by status
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),

    // Revenue by month (last 6 months)
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // Sales by category (Source Data) - joining with Product to get Category
    Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.name",
          value: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { value: -1 } },
    ]),

    // Top Selling Products — aggregate real quantity from order items
    Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          quantitySold: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $project: {
          _id: "$productInfo._id",
          name: "$productInfo.name",
          price: { $ifNull: ["$productInfo.finalPrice", "$productInfo.price"] },
          imageCover: "$productInfo.imageCover",
          sold: "$quantitySold",
          totalRevenue: 1,
          category: { $arrayElemAt: ["$categoryInfo", 0] },
        },
      },
    ]),

    // Recent Orders
    Order.find().sort("-createdAt").limit(5).lean(),

    // Current Month Stats for comparison
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfCurrentMonth } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]),

    // Previous Month Stats for comparison
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfPreviousMonth,
            $lt: startOfCurrentMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]),

    // Wishlist analytics
    wishlistService.getWishlistAnalytics(),
  ]);

  // Format revenue mapping
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedRevenue = revenueByMonth.map((item) => ({
    name: monthNames[item._id.month - 1],
    current: item.revenue,
    previous: 0, // In a real app, you'd fetch previous year data or calculate it
  }));

  // Assign colors to categories
  const colors = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];
  const formattedCategories = salesByCategory.map((item, index) => ({
    name: item._id,
    value: +item.value.toFixed(2),
    color: colors[index % colors.length],
  }));

  // Growth calculations
  const curRev = currentMonthStats[0]?.revenue || 0;
  const prevRev = previousMonthStats[0]?.revenue || 0;
  const revChange =
    prevRev === 0 ? 100 : +(((curRev - prevRev) / prevRev) * 100).toFixed(0);

  const curOrd = currentMonthStats[0]?.count || 0;
  const prevOrd = previousMonthStats[0]?.count || 0;
  const ordChange =
    prevOrd === 0 ? 100 : +(((curOrd - prevOrd) / prevOrd) * 100).toFixed(0);

  return {
    revenue: totalRevenue[0]?.total || 0,
    totalOrders,
    totalProducts,
    totalCustomers,
    totalCategories,
    revenueChart: formattedRevenue,
    categorySales: formattedCategories,
    topProducts: topSellingProducts,
    recentOrders,
    wishlistAnalytics,
    stats: {
      revenueGrowth: revChange,
      orderGrowth: ordChange,
      customerGrowth: 12, // Placeholder
    },
  };
};

module.exports = { getDashboardStats };

"use strict";

const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const GeneralSettings = require("../models/generalSettingsModel");
const AppError = require("../utils/AppError");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../constants/enums");

// ─── Build a new order from request body ──────────────────────────────────────
const buildOrder = async (userId, body, next) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, notes } =
    body;

  // 0) Validate location if restriction is enabled
  const settings = await GeneralSettings.findOne();
  if (settings && settings.enableLocationRestriction) {
    const requestedCity = shippingAddress?.city?.trim();
    if (!requestedCity) {
      throw new AppError(
        "Shipping city is required for delivery validation.",
        400,
      );
    }
    const isAllowed = settings.allowedDeliveryCities.some(
      (city) => city.trim().toLowerCase() === requestedCity.toLowerCase(),
    );
    if (!isAllowed) {
      throw new AppError(
        `Sorry, delivery is not yet supported in ${shippingAddress.city}.`,
        400,
      );
    }
  }

  // 1) Validate products & calculate prices
  const itemsWithPrices = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product).lean();
      if (!product)
        throw new AppError(`Product ${item.product} not found.`, 404);
      if (product.stock < item.quantity)
        throw new AppError(`Insufficient stock for "${product.name}".`, 400);
      return {
        product: product._id,
        name: product.name,
        imageCover: product.imageCover,
        price: product.finalPrice ?? product.price,
        quantity: item.quantity,
      };
    }),
  );

  const itemsPrice = itemsWithPrices.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  // 2) Apply coupon
  let discount = 0;
  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!couponDoc) throw new AppError("Invalid coupon code.", 400);

    const { ok, reason } = couponDoc.isApplicable(userId, itemsPrice);
    if (!ok) throw new AppError(reason, 400);

    discount = couponDoc.computeDiscount(itemsPrice);
  }

  const taxPrice = +(itemsPrice * 0.1).toFixed(2); // 10% tax
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = +(
    itemsPrice +
    taxPrice +
    shippingPrice -
    discount
  ).toFixed(2);

  const order = await Order.create({
    user: userId,
    orderItems: itemsWithPrices,
    shippingAddress,
    paymentMethod,
    itemsPrice: +itemsPrice.toFixed(2),
    taxPrice,
    shippingPrice,
    discount: +discount.toFixed(2),
    totalPrice,
    coupon: couponDoc?._id,
    notes,
  });

  // 3) Decrement stock & increment sold
  await Promise.all(
    itemsWithPrices.map((i) =>
      Product.findByIdAndUpdate(i.product, {
        $inc: { stock: -i.quantity, sold: i.quantity },
      }),
    ),
  );

  // 4) Mark coupon as used
  if (couponDoc) {
    couponDoc.usedCount += 1;
    couponDoc.usedBy.push(userId);
    await couponDoc.save();
  }

  return order;
};

// ─── Order statistics ─────────────────────────────────────────────────────────
const getOrderStats = async () => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        avgOrderValue: { $avg: "$totalPrice" },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);
  return stats;
};

// ─── Mark order delivered ─────────────────────────────────────────────────────
const markDelivered = async (orderId, next) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found.", 404);

  order.orderStatus = ORDER_STATUS.DELIVERED;
  order.deliveredAt = Date.now();
  await order.save();
  return order;
};

// ─── Mark order paid ──────────────────────────────────────────────────────────
const markPaid = async (orderId, paymentResult) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found.", 404);

  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.paidAt = Date.now();
  order.paymentResult = paymentResult;
  await order.save();
  return order;
};

module.exports = { buildOrder, getOrderStats, markDelivered, markPaid };

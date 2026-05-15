"use strict";

const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const AppError = require("../utils/AppError");

const { extractLanguage } = require("../utils/multilingualSchema");

// ── Populate cart items ──────────────────────────────────────────────────────
const populateCartItems = (query) => {
  return query.populate({
    path: "items.product",
    select: "name price finalPrice imageCover stock status slug brand",
  });
};

// ── Get or create cart for user ───────────────────────────────────────────────
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// ── Get cart ──────────────────────────────────────────────────────────────────
const getCart = async (userId) => {
  const cart = await populateCartItems(Cart.findOne({ user: userId }));
  return cart || { items: [], subtotal: 0, total: 0, itemCount: 0 };
};

// ── Add / increment item ──────────────────────────────────────────────────────
const addItem = async (userId, { productId, quantity = 1 }) => {
  const product = await Product.findById(productId).lean();
  if (!product) throw new AppError("Product not found.", 404);
  if (product.status !== "active")
    throw new AppError("Product is not available.", 400);
  if (product.stock < quantity) throw new AppError("Insufficient stock.", 400);

  const cart = await getOrCreateCart(userId);
  const existingIdx = cart.items.findIndex(
    (i) => i.product.toString() === productId.toString(),
  );

  if (existingIdx > -1) {
    const newQty = cart.items[existingIdx].quantity + quantity;
    if (product.stock < newQty)
      throw new AppError(`Only ${product.stock} units available.`, 400);
    cart.items[existingIdx].quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.finalPrice ?? product.price,
      name: extractLanguage(product.name, "en"), // Default to English for cart item snapshot
      imageCover: product.imageCover,
    });
  }

  await cart.save();
  return populateCartItems(Cart.findById(cart._id));
};

// ── Update item quantity ──────────────────────────────────────────────────────
const updateItem = async (userId, productId, quantity) => {
  if (quantity < 1) throw new AppError("Quantity must be at least 1.", 400);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found.", 404);

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new AppError("Item not in cart.", 404);

  // Stock check
  const product = await Product.findById(productId).select("stock").lean();
  if (product && product.stock < quantity)
    throw new AppError(`Only ${product.stock} units available.`, 400);

  item.quantity = quantity;
  await cart.save();
  return populateCartItems(Cart.findById(cart._id));
};

// ── Remove item ───────────────────────────────────────────────────────────────
const removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found.", 404);

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  return populateCartItems(Cart.findById(cart._id));
};

// ── Clear cart ────────────────────────────────────────────────────────────────
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return;
  cart.items = [];
  cart.coupon = null;
  cart.discount = 0;
  await cart.save();
};

// ── Apply coupon to cart ──────────────────────────────────────────────────────
const applyCoupon = async (userId, code) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found.", 404);
  if (!cart.items.length) throw new AppError("Cart is empty.", 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new AppError("Invalid coupon code.", 404);

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { ok, reason } = coupon.isApplicable(userId, subtotal);
  if (!ok) throw new AppError(reason, 400);

  cart.coupon = coupon._id;
  cart.discount = +coupon.computeDiscount(subtotal).toFixed(2);
  await cart.save();
  return populateCartItems(Cart.findById(cart._id));
};

// ── Remove coupon ─────────────────────────────────────────────────────────────
const removeCoupon = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart not found.", 404);
  cart.coupon = null;
  cart.discount = 0;
  await cart.save();
  return populateCartItems(Cart.findById(cart._id));
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};

'use strict';

const Order = require('../models/orderModel');
const chapaService = require('../utils/chapaService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { PAYMENT_STATUS, ORDER_STATUS, PAYMENT_METHOD } = require('../constants/enums');

// ── Initialize Chapa Payment ──────────────────────────────────────────────────
exports.initializeChapaPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  // 1) Find the order
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // 2) Check if order belongs to user (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to pay for this order', 403));
  }

  // 3) Check if order is already paid
  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    return next(new AppError('This order has already been paid', 400));
  }

  // 4) Validate payment method
  if (![PAYMENT_METHOD.CHAPA_CBE, PAYMENT_METHOD.CHAPA_TELEBIRR].includes(order.paymentMethod)) {
    return next(new AppError('Invalid payment method for Chapa', 400));
  }

  // 5) Generate unique transaction reference
  const txRef = `ORDER-${order._id}-${Date.now()}`;

  // 6) Prepare payment data
  const paymentData = {
    amount: order.totalPrice,
    currency: 'ETB',
    email: req.user.email,
    firstName: req.user.name.split(' ')[0] || 'Customer',
    lastName: req.user.name.split(' ').slice(1).join(' ') || 'User',
    phone: req.user.phone || undefined,
    txRef,
    callbackUrl: `${process.env.CHAPA_CALLBACK_URL}`,
    returnUrl: `${process.env.CHAPA_RETURN_URL}/${order._id}`,
    customization: {
      title: 'E-Commerce Store',
      description: `Payment for Order #${order._id}`,
    },
  };

  // 7) Initialize payment with Chapa
  const chapaResponse = await chapaService.initializePayment(paymentData);

  // 8) Store transaction reference in order
  order.paymentResult = {
    id: txRef,
    status: 'pending',
    updateTime: new Date().toISOString(),
    emailAddress: req.user.email,
  };
  await order.save();

  // 9) Return checkout URL
  res.status(200).json({
    status: 'success',
    data: {
      checkoutUrl: chapaResponse.checkoutUrl,
      txRef: chapaResponse.txRef,
      orderId: order._id,
    },
  });
});

// ── Chapa Callback Handler ────────────────────────────────────────────────────
exports.chapaCallback = catchAsync(async (req, res, next) => {
  const { status, tx_ref, trx_ref } = req.query;

  // Use tx_ref or trx_ref (Chapa might send either)
  const txRef = tx_ref || trx_ref;

  if (!txRef) {
    return next(new AppError('Transaction reference is missing', 400));
  }

  // Verify the payment with Chapa
  const verification = await chapaService.verifyPayment(txRef);

  // Find the order by transaction reference
  const order = await Order.findOne({ 'paymentResult.id': txRef });
  
  if (!order) {
    return next(new AppError('Order not found for this transaction', 404));
  }

  // Update order based on verification result
  if (verification.success && verification.status === 'success') {
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.paidAt = Date.now();
    order.orderStatus = ORDER_STATUS.PROCESSING;
    order.paymentResult = {
      id: verification.txRef,
      status: 'success',
      updateTime: new Date().toISOString(),
      emailAddress: verification.email,
      method: verification.method,
      reference: verification.reference,
    };
  } else {
    order.paymentStatus = PAYMENT_STATUS.FAILED;
    order.paymentResult.status = 'failed';
    order.paymentResult.updateTime = new Date().toISOString();
  }

  await order.save();

  // Redirect to frontend with status
  const redirectUrl = `${process.env.CHAPA_RETURN_URL}/${order._id}?status=${order.paymentStatus}`;
  res.redirect(redirectUrl);
});

// ── Chapa Webhook Handler ─────────────────────────────────────────────────────
exports.chapaWebhook = catchAsync(async (req, res, next) => {
  // 1) Verify webhook signature
  const signature = req.headers['chapa-signature'];
  
  if (!chapaService.verifyWebhookSignature(signature, req.body)) {
    return next(new AppError('Invalid webhook signature', 401));
  }

  // 2) Extract webhook data
  const { event, data } = req.body;

  // 3) Handle different event types
  if (event === 'charge.success' || data.status === 'success') {
    const txRef = data.tx_ref || data.trx_ref;
    
    // Find order by transaction reference
    const order = await Order.findOne({ 'paymentResult.id': txRef });
    
    if (order && order.paymentStatus !== PAYMENT_STATUS.PAID) {
      // Verify payment before updating
      const verification = await chapaService.verifyPayment(txRef);
      
      if (verification.success && verification.status === 'success') {
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.paidAt = Date.now();
        order.orderStatus = ORDER_STATUS.PROCESSING;
        order.paymentResult = {
          id: verification.txRef,
          status: 'success',
          updateTime: new Date().toISOString(),
          emailAddress: verification.email,
          method: verification.method,
          reference: verification.reference,
        };
        await order.save();
        
        console.log(`Order ${order._id} marked as paid via webhook`);
      }
    }
  }

  // 4) Acknowledge webhook
  res.status(200).json({ status: 'success', message: 'Webhook received' });
});

// ── Verify Payment Status ─────────────────────────────────────────────────────
exports.verifyPaymentStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  // 1) Find the order
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // 2) Check if order belongs to user (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to view this order', 403));
  }

  // 3) If already paid, return current status
  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    return res.status(200).json({
      status: 'success',
      data: {
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paidAt: order.paidAt,
      },
    });
  }

  // 4) Verify with Chapa if transaction reference exists
  if (order.paymentResult?.id) {
    const verification = await chapaService.verifyPayment(order.paymentResult.id);
    
    if (verification.success && verification.status === 'success') {
      // Update order if payment is successful
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.paidAt = Date.now();
      order.orderStatus = ORDER_STATUS.PROCESSING;
      order.paymentResult.status = 'success';
      order.paymentResult.updateTime = new Date().toISOString();
      await order.save();
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paidAt: order.paidAt,
      paymentResult: order.paymentResult,
    },
  });
});

// ── Get Supported Currencies ──────────────────────────────────────────────────
exports.getSupportedCurrencies = catchAsync(async (req, res, next) => {
  const result = await chapaService.getSupportedCurrencies();
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// ── Get Banks List ────────────────────────────────────────────────────────────
exports.getBanks = catchAsync(async (req, res, next) => {
  const result = await chapaService.getBanks();
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

'use strict';

const Order = require('../models/orderModel');
const chapaService = require('../utils/chapaService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { PAYMENT_STATUS, ORDER_STATUS, PAYMENT_METHOD } = require('../constants/enums');

// ── Helper: Validate Payment Verification ─────────────────────────────────────
const validatePaymentVerification = (verification, order) => {
  const errors = [];

  // 1) Check if verification was successful
  if (!verification.success || verification.status !== 'success') {
    return { valid: false, errors: ['Payment verification failed or status not successful'] };
  }

  // 2) Validate amount (convert to numbers and compare with tolerance for floating point)
  const verifiedAmount = parseFloat(verification.amount);
  const orderAmount = parseFloat(order.totalPrice);
  const amountDifference = Math.abs(verifiedAmount - orderAmount);
  const tolerance = 0.01; // 1 cent tolerance for floating point comparison

  if (amountDifference > tolerance) {
    errors.push(
      `Amount mismatch: verified=${verifiedAmount} ETB, expected=${orderAmount} ETB`
    );
  }

  // 3) Validate currency
  const verifiedCurrency = verification.currency?.toUpperCase() || 'ETB';
  const expectedCurrency = 'ETB'; // Currently only ETB is supported

  if (verifiedCurrency !== expectedCurrency) {
    errors.push(
      `Currency mismatch: verified=${verifiedCurrency}, expected=${expectedCurrency}`
    );
  }

  // 4) Validate transaction reference matches
  const verifiedTxRef = verification.txRef;
  const orderTxRef = order.paymentResult?.id;

  if (verifiedTxRef !== orderTxRef) {
    errors.push(
      `Transaction reference mismatch: verified=${verifiedTxRef}, expected=${orderTxRef}`
    );
  }

  // 5) Return validation result
  if (errors.length > 0) {
    // Log security issue
    console.error('⚠️  PAYMENT VERIFICATION FAILED:', {
      orderId: order._id,
      orderAmount: orderAmount,
      verifiedAmount: verifiedAmount,
      orderTxRef: orderTxRef,
      verifiedTxRef: verifiedTxRef,
      errors: errors,
      timestamp: new Date().toISOString(),
    });

    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
};

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

  // 5) Check for existing pending payment session
  if (order.paymentResult?.id && order.paymentResult?.status === 'pending') {
    // Reuse existing payment session - don't create a new one
    return next(new AppError(
      'A payment session is already in progress for this order. Please complete or cancel the existing payment before creating a new one.',
      400
    ));
  }

  // 6) Generate unique transaction reference (only for new payments)
  const txRef = `ORDER-${order._id}-${Date.now()}`;

  // 7) Prepare payment data
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

  // 8) Initialize payment with Chapa
  const chapaResponse = await chapaService.initializePayment(paymentData);

  // 9) Store transaction reference in order (only after successful initialization)
  order.paymentResult = {
    id: txRef,
    status: 'pending',
    updateTime: new Date().toISOString(),
    emailAddress: req.user.email,
  };
  await order.save();

  // 10) Return checkout URL
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
    // Validate payment details before marking as paid
    const validation = validatePaymentVerification(verification, order);

    if (validation.valid) {
      // Payment is valid - mark as paid
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
      // Payment validation failed - mark as failed
      console.error('⚠️  Payment validation failed in callback:', {
        orderId: order._id,
        txRef: txRef,
        errors: validation.errors,
      });

      order.paymentStatus = PAYMENT_STATUS.FAILED;
      order.paymentResult.status = 'failed';
      order.paymentResult.updateTime = new Date().toISOString();
    }
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
        // Validate payment details before marking as paid
        const validation = validatePaymentVerification(verification, order);

        if (validation.valid) {
          // Payment is valid - mark as paid
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
          
          console.log(`✅ Order ${order._id} marked as paid via webhook`);
        } else {
          // Payment validation failed
          console.error('⚠️  Payment validation failed in webhook:', {
            orderId: order._id,
            txRef: txRef,
            errors: validation.errors,
          });

          order.paymentStatus = PAYMENT_STATUS.FAILED;
          order.paymentResult.status = 'failed';
          order.paymentResult.updateTime = new Date().toISOString();
          await order.save();
        }
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
      // Validate payment details before marking as paid
      const validation = validatePaymentVerification(verification, order);

      if (validation.valid) {
        // Payment is valid - update order if payment is successful
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.paidAt = Date.now();
        order.orderStatus = ORDER_STATUS.PROCESSING;
        order.paymentResult.status = 'success';
        order.paymentResult.updateTime = new Date().toISOString();
        await order.save();
      } else {
        // Payment validation failed
        console.error('⚠️  Payment validation failed in verifyPaymentStatus:', {
          orderId: order._id,
          txRef: order.paymentResult.id,
          errors: validation.errors,
        });

        order.paymentStatus = PAYMENT_STATUS.FAILED;
        order.paymentResult.status = 'failed';
        order.paymentResult.updateTime = new Date().toISOString();
        await order.save();
      }
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

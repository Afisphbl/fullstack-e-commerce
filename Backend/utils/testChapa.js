'use strict';

/**
 * Test script for Chapa integration
 * Run with: node utils/testChapa.js
 */

require('../config/env');
const chapaService = require('./chapaService');

async function testChapaIntegration() {
  console.log('🧪 Testing Chapa Integration...\n');

  try {
    // Test 1: Get Supported Currencies
    console.log('1️⃣ Testing: Get Supported Currencies');
    try {
      const currencies = await chapaService.getSupportedCurrencies();
      console.log('✅ Success:', currencies.success ? 'Currencies fetched' : 'Failed');
      if (currencies.currencies) {
        console.log(`   Found ${currencies.currencies.length} currencies`);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 2: Get Banks List
    console.log('2️⃣ Testing: Get Banks List');
    try {
      const banks = await chapaService.getBanks();
      console.log('✅ Success:', banks.success ? 'Banks fetched' : 'Failed');
      if (banks.banks) {
        console.log(`   Found ${banks.banks.length} banks`);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 3: Initialize Payment (Test Mode)
    console.log('3️⃣ Testing: Initialize Payment');
    try {
      const testPayment = {
        amount: 100,
        currency: 'ETB',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '0912345678',
        txRef: `TEST-${Date.now()}`,
        callbackUrl: process.env.CHAPA_CALLBACK_URL,
        returnUrl: process.env.CHAPA_RETURN_URL,
        customization: {
          title: 'Test Payment',
          description: 'Testing Chapa Integration',
        },
      };

      const result = await chapaService.initializePayment(testPayment);
      console.log('✅ Success:', result.success ? 'Payment initialized' : 'Failed');
      if (result.checkoutUrl) {
        console.log('   Checkout URL:', result.checkoutUrl);
        console.log('   TX Ref:', result.txRef);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 4: Webhook Signature Verification
    console.log('4️⃣ Testing: Webhook Signature Verification');
    try {
      const testPayload = {
        event: 'charge.success',
        data: {
          tx_ref: 'TEST-123456',
          status: 'success',
        },
      };

      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET || 'test-secret')
        .update(JSON.stringify(testPayload))
        .digest('hex');

      const isValid = chapaService.verifyWebhookSignature(signature, testPayload);
      console.log('✅ Success:', isValid ? 'Signature verified' : 'Signature invalid');
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    console.log('✨ Chapa Integration Test Complete!\n');
    console.log('📝 Notes:');
    console.log('   - Make sure CHAPA_SECRET_KEY is set in config.env');
    console.log('   - Use test mode credentials for testing');
    console.log('   - Check Chapa dashboard for test transactions');
    console.log('');

  } catch (error) {
    console.error('💥 Fatal Error:', error.message);
    process.exit(1);
  }
}

// Run tests
testChapaIntegration();

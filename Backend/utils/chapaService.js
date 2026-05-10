'use strict';

const axios = require('axios');
const crypto = require('crypto');
const AppError = require('./AppError');

class ChapaService {
  constructor() {
    this.baseURL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';
    this.secretKey = process.env.CHAPA_SECRET_KEY;
    this.webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
    
    if (!this.secretKey) {
      throw new Error('CHAPA_SECRET_KEY is not configured in environment variables');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Initialize a payment transaction
   * @param {Object} paymentData - Payment initialization data
   * @returns {Promise<Object>} - Chapa response with checkout URL
   */
  async initializePayment(paymentData) {
    try {
      const {
        amount,
        currency = 'ETB',
        email,
        firstName,
        lastName,
        phone,
        txRef,
        callbackUrl,
        returnUrl,
        customization = {},
      } = paymentData;

      // Validate required fields
      if (!amount || !email || !firstName || !lastName || !txRef) {
        throw new AppError('Missing required payment fields', 400);
      }

      // Validate phone number format (must be 10 digits starting with 09 or 07)
      if (phone && !/^(09|07)\d{8}$/.test(phone)) {
        throw new AppError('Phone number must be 10 digits in format 09xxxxxxxx or 07xxxxxxxx', 400);
      }

      const payload = {
        amount: parseFloat(amount).toFixed(2),
        currency,
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        tx_ref: txRef,
        callback_url: callbackUrl || process.env.CHAPA_CALLBACK_URL,
        return_url: returnUrl || process.env.CHAPA_RETURN_URL,
        customization: {
          title: customization.title || 'E-Commerce Payment',
          description: customization.description || 'Payment for order',
          logo: customization.logo,
        },
      };

      const response = await this.client.post('/transaction/initialize', payload);

      if (response.data.status === 'success') {
        return {
          success: true,
          checkoutUrl: response.data.data.checkout_url,
          txRef: txRef,
          message: response.data.message,
        };
      }

      throw new AppError('Failed to initialize payment', 500);
    } catch (error) {
      if (error.response) {
        throw new AppError(
          error.response.data.message || 'Chapa API error',
          error.response.status
        );
      }
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   * @param {String} txRef - Transaction reference
   * @returns {Promise<Object>} - Transaction verification data
   */
  async verifyPayment(txRef) {
    try {
      const response = await this.client.get(`/transaction/verify/${txRef}`);

      if (response.data.status === 'success') {
        const data = response.data.data;
        return {
          success: true,
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          txRef: data.tx_ref,
          chargeResponseCode: data.charge_response_code,
          chargeResponseMessage: data.charge_response_message,
          createdAt: data.created_at,
          method: data.method,
          reference: data.reference,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Verification failed',
      };
    } catch (error) {
      if (error.response) {
        throw new AppError(
          error.response.data.message || 'Failed to verify payment',
          error.response.status
        );
      }
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param {String} signature - Chapa-Signature header value
   * @param {Object} payload - Webhook payload
   * @returns {Boolean} - Whether signature is valid
   */
  verifyWebhookSignature(signature, payload) {
    if (!this.webhookSecret) {
      console.warn('CHAPA_WEBHOOK_SECRET not configured, skipping signature verification');
      return true;
    }

    try {
      const hash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Get supported currencies
   * @returns {Promise<Array>} - List of supported currencies
   */
  async getSupportedCurrencies() {
    try {
      const response = await this.client.get('/currencies');
      
      if (response.data.status === 'success') {
        return {
          success: true,
          currencies: response.data.data,
        };
      }

      return {
        success: false,
        message: 'Failed to fetch currencies',
      };
    } catch (error) {
      if (error.response) {
        throw new AppError(
          error.response.data.message || 'Failed to fetch currencies',
          error.response.status
        );
      }
      throw error;
    }
  }

  /**
   * Get list of banks for transfers
   * @returns {Promise<Array>} - List of banks
   */
  async getBanks() {
    try {
      const response = await this.client.get('/banks');
      
      if (response.data.status === 'success') {
        return {
          success: true,
          banks: response.data.data,
        };
      }

      return {
        success: false,
        message: 'Failed to fetch banks',
      };
    } catch (error) {
      if (error.response) {
        throw new AppError(
          error.response.data.message || 'Failed to fetch banks',
          error.response.status
        );
      }
      throw error;
    }
  }
}

module.exports = new ChapaService();

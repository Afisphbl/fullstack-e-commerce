'use strict';

/**
 * Multilingual Schema Utilities
 * 
 * Provides reusable schema types and helpers for multilingual content.
 * Supports: Amharic (am), English (en), Afaan Oromo (om)
 */

/**
 * Creates a multilingual string schema type
 * @param {boolean} required - Whether all language fields are required
 * @param {number} minLength - Minimum length for each language field
 * @param {number} maxLength - Maximum length for each language field
 * @returns {Object} Mongoose schema definition
 */
const multilingualString = (required = false, minLength = 0, maxLength = undefined) => {
  const fieldDef = {
    type: String,
    required,
    trim: true,
  };

  if (minLength > 0) {
    fieldDef.minlength = [minLength, `Text must be at least ${minLength} characters.`];
  }

  if (maxLength) {
    fieldDef.maxlength = [maxLength, `Text must be at most ${maxLength} characters.`];
  }

  return {
    type: {
      am: fieldDef,
      en: fieldDef,
      om: fieldDef,
    },
    required,
  };
};

/**
 * Creates a multilingual string schema with optional fields
 * @param {number} maxLength - Maximum length for each language field
 * @returns {Object} Mongoose schema definition
 */
const multilingualStringOptional = (maxLength = undefined) => {
  const fieldDef = {
    type: String,
    trim: true,
  };

  if (maxLength) {
    fieldDef.maxlength = [maxLength, `Text must be at most ${maxLength} characters.`];
  }

  return {
    type: {
      am: fieldDef,
      en: fieldDef,
      om: fieldDef,
    },
    required: false,
  };
};

/**
 * Extracts a specific language from a multilingual field
 * @param {Object|string} field - Multilingual field or plain string
 * @param {string} lang - Language code (am, en, om)
 * @param {string} fallback - Fallback language (default: 'en')
 * @returns {string} Extracted text
 */
const extractLanguage = (field, lang = 'en', fallback = 'en') => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  
  return field[lang] || field[fallback] || field.en || field.am || field.om || '';
};

/**
 * Validates that all required languages are present
 * @param {Object} field - Multilingual field
 * @returns {boolean} True if all languages present
 */
const hasAllLanguages = (field) => {
  if (!field || typeof field !== 'object') return false;
  return Boolean(field.am && field.en && field.om);
};

/**
 * Creates a default multilingual object with the same value for all languages
 * @param {string} value - Default value
 * @returns {Object} Multilingual object
 */
const createMultilingualDefault = (value) => ({
  am: value,
  en: value,
  om: value,
});

/**
 * Transforms a plain string field to multilingual format
 * Used for data migration
 * @param {string} value - Plain string value
 * @returns {Object} Multilingual object
 */
const migrateToMultilingual = (value) => {
  if (!value) return { am: '', en: '', om: '' };
  if (typeof value === 'object' && value.am && value.en && value.om) {
    return value; // Already multilingual
  }
  return createMultilingualDefault(value);
};

/**
 * Validates multilingual field structure
 * @param {Object} field - Field to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validateMultilingualField = (field) => {
  const errors = [];
  
  if (!field || typeof field !== 'object') {
    errors.push('Field must be an object');
    return { valid: false, errors };
  }
  
  if (!field.am) errors.push('Amharic (am) translation is missing');
  if (!field.en) errors.push('English (en) translation is missing');
  if (!field.om) errors.push('Afaan Oromo (om) translation is missing');
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  multilingualString,
  multilingualStringOptional,
  extractLanguage,
  hasAllLanguages,
  createMultilingualDefault,
  migrateToMultilingual,
  validateMultilingualField,
};

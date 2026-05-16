'use strict';

/**
 * Middleware to parse multilingual fields from FormData
 * 
 * Converts fields like:
 *   name[en] = "Product"
 *   name[am] = "ምርት"
 *   name[om] = "Oomisha"
 * 
 * Into:
 *   name = { en: "Product", am: "ምርት", om: "Oomisha" }
 */
const parseMultilingualFields = (req, res, next) => {
  if (!req.body) return next();

  console.log('=== parseMultilingualFields BEFORE ===');
  console.log('req.body keys:', Object.keys(req.body));
  console.log('req.body:', req.body);

  const multilingualFields = {};
  const keysToDelete = [];

  // Find all fields with [lang] pattern
  Object.keys(req.body).forEach((key) => {
    const match = key.match(/^(.+)\[(am|en|om)\]$/);
    if (match) {
      const [, fieldName, lang] = match;
      
      if (!multilingualFields[fieldName]) {
        multilingualFields[fieldName] = {};
      }
      
      multilingualFields[fieldName][lang] = req.body[key];
      keysToDelete.push(key);
      console.log(`Found multilingual field: ${fieldName}[${lang}] = "${req.body[key]}"`);
    }
  });

  // Remove the original [lang] keys and add the reconstructed objects
  keysToDelete.forEach((key) => delete req.body[key]);
  Object.assign(req.body, multilingualFields);

  console.log('=== parseMultilingualFields AFTER ===');
  console.log('Reconstructed fields:', multilingualFields);
  console.log('req.body:', req.body);

  next();
};

module.exports = parseMultilingualFields;

"use strict";

/**
 * Middleware to determine the requested locale and attach it to the request object.
 * Checks the 'Accept-Language' header or ?lang query param, falling back to 'am'.
 */
const resolveLocale = (req, res, next) => {
  const queryLang = req.query.lang;
  if (queryLang && ["am", "en", "om"].includes(queryLang)) {
    req.locale = queryLang;
    return next();
  }

  const acceptLanguage = req.headers["accept-language"];
  let locale = "am"; // Default language

  if (acceptLanguage) {
    const preferredLang = acceptLanguage
      .split(",")[0]
      .split("-")[0]
      .toLowerCase();
    if (["am", "en", "om"].includes(preferredLang)) {
      locale = preferredLang;
    }
  }

  req.locale = locale;

  // Intercept res.json to flatten translated fields recursively
  const originalJson = res.json;

  const flattenLocaleFields = (obj, targetLocale) => {
    if (obj === null || obj === undefined) return obj;

    // If it's a mongoose document, convert to plain object
    if (typeof obj.toObject === "function") {
      obj = obj.toObject();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => flattenLocaleFields(item, targetLocale));
    }

    if (typeof obj === "object") {
      // Check if this object is a translation map (has am, en, om keys)
      // This is a naive check. A better approach is to see if it specifically holds the locale keys
      // and only those keys.
      if (
        Object.keys(obj).some((k) => ["am", "en", "om"].includes(k)) &&
        Object.keys(obj).every((k) =>
          ["am", "en", "om", "_id", "id"].includes(k),
        )
      ) {
        // Return the requested locale, fallback to 'am' if not available
        const value = obj[targetLocale] || obj["am"] || obj["en"] || "";
        return value;
      }

      const newObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = flattenLocaleFields(obj[key], targetLocale);
        }
      }
      return newObj;
    }

    return obj;
  };

  res.json = function (body) {
    const flattenedBody = flattenLocaleFields(body, req.locale);
    originalJson.call(this, flattenedBody);
  };

  next();
};

module.exports = resolveLocale;

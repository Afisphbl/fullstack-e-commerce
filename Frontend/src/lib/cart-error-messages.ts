/**
 * Cart Error Message Mapping Utility
 *
 * Maps backend error messages to user-friendly messages for cart operations.
 * Handles product availability, stock validation, coupon errors, and network issues.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

export interface CartErrorContext {
  availableStock?: number;
  productName?: string;
  couponCode?: string;
}

/**
 * Interface for API and Application Errors
 */
export interface AppError {
  message?: string;
  name?: string;
  code?: string;
  stack?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      availableStock?: number;
      stock?: number;
    };
  };
  data?: {
    message?: string;
    stock?: number;
  };
}

/**
 * Type guard to check if an error is an AppError object
 */
const isObjectError = (
  error: AppError | string | null | undefined
): error is AppError => {
  return typeof error === "object" && error !== null;
};

/**
 * Maps backend error messages to translation keys
 *
 * @param errorMessage - The error message from the backend or error object
 * @param context - Optional context with additional information (e.g., available stock)
 * @returns Object with translation key and optional params
 */
export function mapCartErrorMessage(
  errorMessage: string,
  context?: CartErrorContext
): { key: string; values?: Record<string, string | number> } {
  const message = (errorMessage || "").toLowerCase();

  // Product not found errors
  if (
    message.includes("product not found") ||
    message.includes("product does not exist")
  ) {
    return { key: "cart:errors.productNotFound" };
  }

  // Product availability errors
  if (
    message.includes("product is not available") ||
    message.includes("product is unavailable")
  ) {
    return { key: "cart:errors.productUnavailable" };
  }

  // Stock validation errors
  if (
    message.includes("insufficient stock") ||
    message.includes("not enough stock")
  ) {
    if (context?.availableStock !== undefined) {
      return {
        key: "cart:errors.onlyUnitsAvailable",
        values: { count: context.availableStock },
      };
    }
    return { key: "cart:errors.insufficientStock" };
  }

  // Specific stock quantity errors (e.g., "Only 5 units available")
  const stockMatch = message.match(/only (\d+) units? available/i);
  if (stockMatch && stockMatch[1]) {
    const stock = parseInt(stockMatch[1], 10);
    return {
      key: "cart:errors.onlyUnitsAvailable",
      values: { count: stock },
    };
  }

  // Cart not found errors
  if (
    message.includes("cart not found") ||
    message.includes("cart does not exist")
  ) {
    return { key: "cart:errors.cartLoadFailed" };
  }

  // Coupon validation errors
  if (
    message.includes("invalid coupon") ||
    message.includes("coupon not found") ||
    message.includes("coupon does not exist")
  ) {
    return { key: "cart:errors.invalidCoupon" };
  }

  if (
    message.includes("coupon expired") ||
    message.includes("coupon has expired")
  ) {
    return { key: "cart:errors.expiredCoupon" };
  }

  if (
    message.includes("coupon not applicable") ||
    message.includes("minimum order")
  ) {
    return { key: "cart:errors.couponNotApplicable" };
  }

  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("failed to fetch")
  ) {
    return { key: "cart:errors.connectionError" };
  }

  // Authentication errors
  if (
    message.includes("unauthorized") ||
    message.includes("not authenticated") ||
    message.includes("not logged in")
  ) {
    return { key: "cart:errors.loginRequired" };
  }

  // Server errors (5xx)
  if (
    message.includes("server error") ||
    message.includes("internal error") ||
    message.match(/5\d{2}/)
  ) {
    return { key: "cart:errors.serverError" };
  }

  // Generic fallback
  return { key: "cart:errors.genericError" };
}

/**
 * Extracts available stock quantity from error message or response
 *
 * @param error - Error object or message from backend
 * @returns Available stock quantity if found, undefined otherwise
 */
export function extractAvailableStock(
  error: AppError | string | null | undefined
): number | undefined {
  if (!error) return undefined;

  // Check if error has a structured response with stock info
  if (
    isObjectError(error) &&
    error.response?.data?.availableStock !== undefined
  ) {
    return error.response.data.availableStock;
  }

  // Try to extract from error message
  const message = typeof error === "string" ? error : error.message || "";
  const stockMatch = message.match(/only (\d+) units? available/i);
  if (stockMatch && stockMatch[1]) {
    return parseInt(stockMatch[1], 10);
  }

  // Check for stock in error data
  if (isObjectError(error) && error.data?.stock !== undefined) {
    return error.data.stock;
  }

  return undefined;
}

/**
 * Determines if an error is a network error
 *
 * @param error - Error object
 * @returns True if the error is network-related
 */
export function isNetworkError(
  error: AppError | string | null | undefined
): boolean {
  if (!error) return false;

  const message = (
    typeof error === "string" ? error : error.message || ""
  ).toLowerCase();

  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("failed to fetch") ||
    (isObjectError(error) && error.name === "NetworkError") ||
    (isObjectError(error) && error.code === "NETWORK_ERROR")
  );
}

/**
 * Determines if an error is a validation error (user action required)
 *
 * @param error - Error object
 * @returns True if the error is a validation error
 */
export function isValidationError(
  error: AppError | string | null | undefined
): boolean {
  if (!error) return false;

  const message = (
    typeof error === "string" ? error : error.message || ""
  ).toLowerCase();

  return (
    message.includes("insufficient stock") ||
    message.includes("not enough stock") ||
    message.includes("product not found") ||
    message.includes("product is not available") ||
    message.includes("invalid coupon") ||
    message.includes("coupon expired") ||
    message.includes("units available") ||
    (isObjectError(error) && error.response?.status === 400) ||
    (isObjectError(error) && error.response?.status === 404)
  );
}

/**
 * Determines if an error should trigger a retry
 *
 * @param error - Error object
 * @returns True if the operation should be retried
 */
export function shouldRetryError(
  error: AppError | string | null | undefined
): boolean {
  // Retry network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Don't retry validation errors (user action required)
  if (isValidationError(error)) {
    return false;
  }

  // Don't retry authentication errors (redirect to login)
  const message = (
    (error && (typeof error === "string" ? error : error.message || "")) ||
    ""
  ).toLowerCase();

  if (
    message.includes("unauthorized") ||
    message.includes("not authenticated")
  ) {
    return false;
  }

  // Don't retry server errors (5xx)
  if (
    isObjectError(error) &&
    error.response?.status &&
    error.response.status >= 500
  ) {
    return false;
  }

  // Default: don't retry
  return false;
}

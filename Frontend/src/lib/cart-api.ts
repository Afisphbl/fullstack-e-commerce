import { apiFetch } from "./api-client";

// ── TypeScript Interfaces ─────────────────────────────────────────────────────

/**
 * Backend cart item structure
 * Represents a single item in the cart with product reference and quantity
 */
export interface BackendCartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    slug: string;
    brand?: string;
    finalPrice: number;
    imageCover: string;
    stock: number;
    status: string;
  };
  quantity: number;
  price: number;
  name: string;
  imageCover: string;
}

/**
 * Backend cart structure
 * Represents the complete cart with items, coupon, and calculated totals
 */
export interface BackendCart {
  _id: string;
  user: string;
  items: BackendCartItem[];
  coupon?: string;
  discount: number;
  subtotal: number;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * API response wrapper for cart operations
 */
interface CartApiResponse {
  status: string;
  data: {
    cart: BackendCart;
  };
}

// ── Cart API Client ───────────────────────────────────────────────────────────

/**
 * Get the authenticated user's cart
 * @returns Promise<BackendCart> The user's cart data
 * @throws Error if the request fails or user is not authenticated
 */
export const getCart = async (): Promise<BackendCart> => {
  const response: CartApiResponse = await apiFetch("/api/v1/cart", {
    method: "GET",
  });
  return response.data.cart;
};

/**
 * Add an item to the cart
 * @param productId - The ID of the product to add
 * @param quantity - The quantity to add (default: 1)
 * @returns Promise<BackendCart> The updated cart data
 * @throws Error if the product is not found, out of stock, or request fails
 */
export const addItem = async (
  productId: string,
  quantity: number = 1,
): Promise<BackendCart> => {
  const response: CartApiResponse = await apiFetch("/api/v1/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  return response.data.cart;
};

/**
 * Update the quantity of an item in the cart
 * @param productId - The ID of the product to update
 * @param quantity - The new quantity (must be >= 1)
 * @returns Promise<BackendCart> The updated cart data
 * @throws Error if the product is not in cart, insufficient stock, or request fails
 */
export const updateItem = async (
  productId: string,
  quantity: number,
): Promise<BackendCart> => {
  const response: CartApiResponse = await apiFetch(
    `/api/v1/cart/${productId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
  );
  return response.data.cart;
};

/**
 * Remove an item from the cart
 * @param productId - The ID of the product to remove
 * @returns Promise<BackendCart> The updated cart data
 * @throws Error if the product is not in cart or request fails
 */
export const removeItem = async (productId: string): Promise<BackendCart> => {
  const response: CartApiResponse = await apiFetch(
    `/api/v1/cart/${productId}`,
    {
      method: "DELETE",
    },
  );
  return response.data.cart;
};

/**
 * Clear all items from the cart
 * @returns Promise<void>
 * @throws Error if the request fails
 */
export const clearCart = async (): Promise<void> => {
  // Backend returns 204 No Content for clearCart
  await apiFetch("/api/v1/cart", {
    method: "DELETE",
  });
};

/**
 * Apply a coupon code to the cart
 * @param code - The coupon code to apply
 * @returns Promise<BackendCart> The updated cart data with discount applied
 * @throws Error if the coupon is invalid, expired, or request fails
 */
export const applyCoupon = async (code: string): Promise<BackendCart> => {
  const response: CartApiResponse = await apiFetch("/api/v1/cart/coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return response.data.cart;
};

/**
 * Remove the applied coupon from the cart
 * @returns Promise<BackendCart> The updated cart data with discount removed
 * @throws Error if the request fails
 */
export const removeCoupon = async (): Promise<BackendCart> => {
  const response: CartApiResponse = await apiFetch("/api/v1/cart/coupon", {
    method: "DELETE",
  });
  return response.data.cart;
};

/**
 * Cart API client interface
 * Provides all cart-related API operations
 */
export const CartApiClient = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};

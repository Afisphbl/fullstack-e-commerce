import { CartItem } from "@/contexts/CartContext";

/**
 * Local storage key for guest cart data
 */
const GUEST_CART_KEY = "guest_cart";

/**
 * Local storage schema for guest cart
 */
interface LocalCartStorage {
  items: CartItem[];
  timestamp: number;
}

/**
 * Save guest cart items to localStorage
 * @param items - Array of cart items to save
 */
export const saveGuestCart = (items: CartItem[]): void => {
  try {
    const cartData: LocalCartStorage = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error("Failed to save guest cart to localStorage:", error);
  }
};

/**
 * Load guest cart items from localStorage
 * @returns Array of cart items, or empty array if not found or error occurs
 */
export const loadGuestCart = (): CartItem[] => {
  try {
    const cartDataString = localStorage.getItem(GUEST_CART_KEY);
    if (!cartDataString) {
      return [];
    }

    const cartData: LocalCartStorage = JSON.parse(cartDataString);
    
    // Validate the structure
    if (!cartData.items || !Array.isArray(cartData.items)) {
      console.warn("Invalid guest cart data structure, returning empty cart");
      return [];
    }

    return cartData.items;
  } catch (error) {
    console.error("Failed to load guest cart from localStorage:", error);
    // Clear corrupted data
    clearGuestCart();
    return [];
  }
};

/**
 * Clear guest cart from localStorage
 */
export const clearGuestCart = (): void => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error("Failed to clear guest cart from localStorage:", error);
  }
};

/**
 * Get the timestamp of the last guest cart update
 * @returns Timestamp in milliseconds, or null if not found
 */
export const getGuestCartTimestamp = (): number | null => {
  try {
    const cartDataString = localStorage.getItem(GUEST_CART_KEY);
    if (!cartDataString) {
      return null;
    }

    const cartData: LocalCartStorage = JSON.parse(cartDataString);
    return cartData.timestamp || null;
  } catch (error) {
    console.error("Failed to get guest cart timestamp:", error);
    return null;
  }
};

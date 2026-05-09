import { CartItem } from "@/contexts/CartContext";
import { BackendCartItem } from "./cart-api";

/**
 * Merge guest cart items with backend cart items
 * For duplicate products, keep the higher quantity
 * 
 * @param guestItems - Cart items from local storage (guest cart)
 * @param backendItems - Cart items from backend API (authenticated user's cart)
 * @returns Array of items to add/update in backend with productId and quantity
 */
export const mergeCartItems = (
  guestItems: CartItem[],
  backendItems: BackendCartItem[]
): Array<{ productId: string; quantity: number }> => {
  // Create a map of backend items for quick lookup
  const backendMap = new Map<string, number>();
  backendItems.forEach((item) => {
    backendMap.set(item.product._id, item.quantity);
  });

  // Create a map to store the merged result
  const mergedMap = new Map<string, number>();

  // Add all backend items to merged map
  backendItems.forEach((item) => {
    mergedMap.set(item.product._id, item.quantity);
  });

  // Process guest items
  guestItems.forEach((guestItem) => {
    const productId = guestItem.product.id;
    const guestQuantity = guestItem.quantity;
    const backendQuantity = backendMap.get(productId);

    if (backendQuantity !== undefined) {
      // Product exists in both carts - keep higher quantity
      const maxQuantity = Math.max(guestQuantity, backendQuantity);
      mergedMap.set(productId, maxQuantity);
    } else {
      // Product only exists in guest cart - add it
      mergedMap.set(productId, guestQuantity);
    }
  });

  // Convert merged map to array of items to update
  const itemsToUpdate: Array<{ productId: string; quantity: number }> = [];
  
  mergedMap.forEach((quantity, productId) => {
    const backendQuantity = backendMap.get(productId);
    
    // Only include items that need to be added or updated
    // (i.e., not already in backend with the same quantity)
    if (backendQuantity === undefined || backendQuantity !== quantity) {
      itemsToUpdate.push({ productId, quantity });
    }
  });

  return itemsToUpdate;
};

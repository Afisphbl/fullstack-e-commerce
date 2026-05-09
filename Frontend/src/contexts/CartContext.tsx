import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { Product } from "@/lib/api";
import { useAuth } from "./AuthContext";
import {
  useCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} from "@/hooks/useCartQuery";
import { BackendCartItem } from "@/lib/cart-api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useKeyedDebounce } from "@/hooks/useDebounce";
import {
  mapCartErrorMessage,
  extractAvailableStock,
  isNetworkError,
  shouldRetryError,
} from "@/lib/cart-error-messages";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
  total: number;
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [discount, setDiscount] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const queryClient = useQueryClient();

  // Track previous authentication state for detecting login/logout
  const prevAuthStateRef = useRef<boolean>(isAuthenticated);

  // Fetch cart from backend for authenticated users
  const {
    data: backendCart,
    isLoading: isCartQueryLoading,
    error: cartQueryError,
    refetch: refetchCart,
  } = useCartQuery(isAuthenticated);

  // Mutation hooks for cart operations
  const addToCartMutation = useAddToCartMutation();
  const updateCartMutation = useUpdateCartMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();
  const clearCartMutation = useClearCartMutation();
  const applyCouponMutation = useApplyCouponMutation();
  const removeCouponMutation = useRemoveCouponMutation();

  // Debounced backend update for quantity changes (500ms delay)
  // This batches rapid quantity updates to reduce backend requests
  const debouncedBackendUpdate = useKeyedDebounce(
    (productId: string, quantity: number, previousItems: CartItem[]) => {
      updateCartMutation.mutate(
        { productId, quantity },
        {
          onError: (error: any) => {
            // Log error for debugging
            console.error("Failed to update cart quantity:", error);

            // Rollback optimistic update
            setItems(previousItems);

            // Extract available stock from error
            const availableStock = extractAvailableStock(error);

            // Map error to user-friendly message
            const errorMessage = error?.message || error?.toString() || "Unknown error";
            const userMessage = mapCartErrorMessage(errorMessage, {
              availableStock,
            });

            // Display error with retry option for network errors
            if (isNetworkError(error)) {
              toast.error(userMessage, {
                action: {
                  label: "Retry",
                  onClick: () => {
                    updateCartMutation.mutate({ productId, quantity });
                  },
                },
              });
            } else {
              toast.error(userMessage);
            }
          },
        }
      );
    },
    500
  );

  // No longer loading guest cart from localStorage on mount

  // Handle authentication state changes (login/logout)
  useEffect(() => {
    const prevAuthState = prevAuthStateRef.current;
    const currentAuthState = isAuthenticated;

    // Detect login: authentication changed from false to true
    // No longer merging guest cart since we don't use localStorage

    // Detect logout: authentication changed from true to false
    if (prevAuthState && !currentAuthState) {
      // Clear cart state in CartContext
      setItems([]);
      
      // Invalidate React Query cache for cart data
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }

    // Update previous auth state
    prevAuthStateRef.current = currentAuthState;
  }, [isAuthenticated, queryClient]);

  // Transform backend cart items to frontend format
  useEffect(() => {
    if (isAuthenticated && backendCart) {
      const transformedItems: CartItem[] = backendCart.items.map(
        (item: BackendCartItem) => ({
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.product.finalPrice || item.product.price,
            finalPrice: item.product.finalPrice,
            image: item.product.imageCover,
            imageCover: item.product.imageCover,
            stock: item.product.stock,
            status: item.product.status,
          } as Product,
          quantity: item.quantity,
        })
      );
      setItems(transformedItems);
      
      // Update coupon and totals from backend
      setCouponCode(backendCart.coupon);
      setDiscount(backendCart.discount || 0);
      setSubtotal(backendCart.subtotal || 0);
      
      setIsLoading(false);
    } else if (isAuthenticated && cartQueryError) {
      // Handle error: retry once after 1 second
      console.error("Failed to fetch cart:", cartQueryError);
      setTimeout(() => {
        refetchCart();
      }, 1000);
      setIsLoading(false);
    } else if (isAuthenticated && !backendCart && !isCartQueryLoading) {
      // Empty cart state
      setItems([]);
      setCouponCode(undefined);
      setDiscount(0);
      setSubtotal(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, backendCart, cartQueryError, isCartQueryLoading, refetchCart]);

  // Update loading state based on query loading
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(isCartQueryLoading);
    }
  }, [isAuthenticated, isCartQueryLoading]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (isAuthenticated) {
        // Backend mode: use mutation with optimistic update
        const previousItems = [...items];

        // Optimistic update: immediately add to UI
        setItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          if (existing) {
            return prev.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          }
          return [...prev, { product, quantity }];
        });
        setIsCartOpen(true);

        // Call backend API
        addToCartMutation.mutate(
          { productId: product.id, quantity },
          {
            onError: (error: any) => {
              // Log error for debugging
              console.error("Failed to add item to cart:", error);

              // Rollback optimistic update
              setItems(previousItems);

              // Extract available stock from error
              const availableStock = extractAvailableStock(error);

              // Map error to user-friendly message
              const errorMessage = error?.message || error?.toString() || "Unknown error";
              const userMessage = mapCartErrorMessage(errorMessage, {
                availableStock,
                productName: product.name,
              });

              // Display error with retry option for network errors
              if (isNetworkError(error)) {
                toast.error(userMessage, {
                  action: {
                    label: "Retry",
                    onClick: () => {
                      addToCartMutation.mutate({ productId: product.id, quantity });
                    },
                  },
                });
              } else {
                toast.error(userMessage);
              }
            },
          }
        );
      } else {
        // Guest mode: use local state only (no localStorage)
        setItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          if (existing) {
            return prev.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          }
          return [...prev, { product, quantity }];
        });
        setIsCartOpen(true);
      }
    },
    [isAuthenticated, items, addToCartMutation]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        // Backend mode: use mutation with optimistic update
        const previousItems = [...items];

        // Optimistic update: immediately remove from UI
        setItems((prev) => prev.filter((i) => i.product.id !== productId));

        // Call backend API
        removeFromCartMutation.mutate(productId, {
          onError: (error: any) => {
            // Log error for debugging
            console.error("Failed to remove item from cart:", error);

            // Rollback optimistic update
            setItems(previousItems);

            // Map error to user-friendly message
            const errorMessage = error?.message || error?.toString() || "Unknown error";
            const userMessage = mapCartErrorMessage(errorMessage);

            // Display error with retry option for network errors
            if (isNetworkError(error)) {
              toast.error(userMessage, {
                action: {
                  label: "Retry",
                  onClick: () => {
                    removeFromCartMutation.mutate(productId);
                  },
                },
              });
            } else {
              toast.error(userMessage);
            }
          },
        });
      } else {
        // Guest mode: use local state only (no localStorage)
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
      }
    },
    [isAuthenticated, items, removeFromCartMutation]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        if (isAuthenticated) {
          const previousItems = [...items];
          setItems((prev) => prev.filter((i) => i.product.id !== productId));

          removeFromCartMutation.mutate(productId, {
            onError: (error: any) => {
              // Log error for debugging
              console.error("Failed to remove item from cart:", error);

              setItems(previousItems);

              // Map error to user-friendly message
              const errorMessage = error?.message || error?.toString() || "Unknown error";
              const userMessage = mapCartErrorMessage(errorMessage);

              // Display error with retry option for network errors
              if (isNetworkError(error)) {
                toast.error(userMessage, {
                  action: {
                    label: "Retry",
                    onClick: () => {
                      removeFromCartMutation.mutate(productId);
                    },
                  },
                });
              } else {
                toast.error(userMessage);
              }
            },
          });
        } else {
          setItems((prev) => prev.filter((i) => i.product.id !== productId));
        }
        return;
      }

      if (isAuthenticated) {
        // Backend mode: use mutation with optimistic update and debouncing
        const previousItems = [...items];

        // Optimistic update: immediately update quantity in UI
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          )
        );

        // Debounce backend call (500ms) - pending calls are automatically cancelled on unmount
        debouncedBackendUpdate(productId, quantity, previousItems);
      } else {
        // Guest mode: use local state only (no localStorage)
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          )
        );
      }
    },
    [isAuthenticated, items, removeFromCartMutation, debouncedBackendUpdate]
  );

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      // Backend mode: use mutation with optimistic update
      const previousItems = [...items];

      // Optimistic update: immediately clear cart in UI
      setItems([]);

      // Call backend API
      clearCartMutation.mutate(undefined, {
        onError: (error: any) => {
          // Log error for debugging
          console.error("Failed to clear cart:", error);

          // Rollback optimistic update
          setItems(previousItems);

          // Map error to user-friendly message
          const errorMessage = error?.message || error?.toString() || "Unknown error";
          const userMessage = mapCartErrorMessage(errorMessage);

          // Display error with retry option for network errors
          if (isNetworkError(error)) {
            toast.error(userMessage, {
              action: {
                label: "Retry",
                onClick: () => {
                  clearCartMutation.mutate(undefined);
                },
              },
            });
          } else {
            toast.error(userMessage);
          }
        },
      });
    } else {
      // Guest mode: use local state only (no localStorage)
      setItems([]);
    }
  }, [isAuthenticated, items, clearCartMutation]);

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!isAuthenticated) {
        toast.error("Please log in to apply coupons");
        return;
      }

      // Optimistic update
      const previousCouponCode = couponCode;
      const previousDiscount = discount;
      setCouponCode(code);

      try {
        await applyCouponMutation.mutateAsync(code);
        toast.success("Coupon applied successfully");
      } catch (error: any) {
        // Log error for debugging
        console.error("Failed to apply coupon:", error);

        // Rollback optimistic update
        setCouponCode(previousCouponCode);
        setDiscount(previousDiscount);

        // Map error to user-friendly message
        const errorMessage = error?.message || error?.toString() || "Unknown error";
        const userMessage = mapCartErrorMessage(errorMessage, {
          couponCode: code,
        });

        // Display error with retry option for network errors
        if (isNetworkError(error)) {
          toast.error(userMessage, {
            action: {
              label: "Retry",
              onClick: () => {
                applyCoupon(code);
              },
            },
          });
        } else {
          toast.error(userMessage);
        }
      }
    },
    [isAuthenticated, couponCode, discount, applyCouponMutation]
  );

  const removeCoupon = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    // Optimistic update
    const previousCouponCode = couponCode;
    const previousDiscount = discount;
    setCouponCode(undefined);
    setDiscount(0);

    try {
      await removeCouponMutation.mutateAsync();
      toast.success("Coupon removed");
    } catch (error: any) {
      // Log error for debugging
      console.error("Failed to remove coupon:", error);

      // Rollback optimistic update
      setCouponCode(previousCouponCode);
      setDiscount(previousDiscount);

      // Map error to user-friendly message
      const errorMessage = error?.message || error?.toString() || "Unknown error";
      const userMessage = mapCartErrorMessage(errorMessage);

      // Display error with retry option for network errors
      if (isNetworkError(error)) {
        toast.error(userMessage, {
          action: {
            label: "Retry",
            onClick: () => {
              removeCoupon();
            },
          },
        });
      } else {
        toast.error(userMessage);
      }
    }
  }, [isAuthenticated, couponCode, discount, removeCouponMutation]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Calculate totals
  // For authenticated users with backend cart, use backend totals
  // For guest users, calculate from items
  const calculatedSubtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = isAuthenticated && backendCart ? backendCart.total : calculatedSubtotal;
  const finalSubtotal = isAuthenticated && backendCart ? backendCart.subtotal : calculatedSubtotal;
  const finalDiscount = isAuthenticated && backendCart ? backendCart.discount : 0;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        setCartOpen: setIsCartOpen,
        total,
        itemCount,
        subtotal: finalSubtotal,
        discount: finalDiscount,
        couponCode,
        applyCoupon,
        removeCoupon,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

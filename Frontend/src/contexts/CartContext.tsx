import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { Product, extractLocalized } from "@/lib/api";
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
import { useTranslation } from "react-i18next";
import {
  mapCartErrorMessage,
  extractAvailableStock,
  isNetworkError,
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
  const { t } = useTranslation(["cart", "common"]);
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [discount, setDiscount] = useState<number>(0);
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

  // Use a ref to access current items in callbacks without triggering dependency loops
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Debounced backend update for quantity changes (500ms delay)
  const debouncedBackendUpdate = useKeyedDebounce(
    (productId: string, ...args: unknown[]) => {
      const [quantity, previousItems] = args as [number, CartItem[]];
      updateCartMutation.mutate(
        { productId, quantity },
        {
          onError: (error: Error) => {
            console.error("Failed to update cart quantity:", error);
            setItems(previousItems);

            const availableStock = extractAvailableStock(error);
            const errorMessage =
              error?.message || error?.toString() || "Unknown error";
            const mappedError = mapCartErrorMessage(errorMessage, {
              availableStock,
            });
            const userMessage = t(mappedError.key, mappedError.values);

            if (isNetworkError(error)) {
              toast.error(userMessage, {
                action: {
                  label: t("common:tryAgain"),
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

  // Handle authentication state changes (login/logout)
  useEffect(() => {
    const prevAuthState = prevAuthStateRef.current;
    const currentAuthState = isAuthenticated;

    if (prevAuthState && !currentAuthState) {
      setItems([]);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }

    prevAuthStateRef.current = currentAuthState;
  }, [isAuthenticated, queryClient]);

  // Transform backend cart items to frontend format
  useEffect(() => {
    if (isAuthenticated && backendCart) {
      const transformedItems: CartItem[] = backendCart.items.map(
        (item: BackendCartItem) => ({
          product: {
            id: item.product._id,
            name: extractLocalized(item.product.name),
            slug: item.product.slug,
            brand: item.product.brand || "",
            price: item.product.finalPrice || item.product.price,
            finalPrice: item.product.finalPrice,
            image: item.product.imageCover,
            imageCover: item.product.imageCover,
            stock: item.product.stock,
            status: item.product.status,
          } as unknown as Product,
          quantity: item.quantity,
        })
      );
      setItems(transformedItems);
      setCouponCode(backendCart.coupon);
      setDiscount(backendCart.discount || 0);
      setIsLoading(false);
    } else if (isAuthenticated && cartQueryError) {
      console.error("Failed to fetch cart:", cartQueryError);
      setTimeout(() => {
        refetchCart();
      }, 1000);
      setIsLoading(false);
    } else if (isAuthenticated && !backendCart && !isCartQueryLoading) {
      setItems([]);
      setCouponCode(undefined);
      setDiscount(0);
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    backendCart,
    cartQueryError,
    isCartQueryLoading,
    refetchCart,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(isCartQueryLoading);
    }
  }, [isAuthenticated, isCartQueryLoading]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (isAuthenticated) {
        const previousItems = [...itemsRef.current];
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

        addToCartMutation.mutate(
          { productId: product.id, quantity },
          {
            onError: (error: Error) => {
              console.error("Failed to add item to cart:", error);
              setItems(previousItems);
              const availableStock = extractAvailableStock(error);
              const errorMessage =
                error?.message || error?.toString() || "Unknown error";
              const mappedError = mapCartErrorMessage(errorMessage, {
                availableStock,
                productName: product.name,
              });
              const userMessage = t(mappedError.key, mappedError.values);

              if (isNetworkError(error)) {
                toast.error(userMessage, {
                  action: {
                    label: t("common:tryAgain"),
                    onClick: () => {
                      addToCartMutation.mutate({
                        productId: product.id,
                        quantity,
                      });
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
    [isAuthenticated, addToCartMutation, t]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        const previousItems = [...itemsRef.current];
        setItems((prev) => prev.filter((i) => i.product.id !== productId));

        removeFromCartMutation.mutate(productId, {
          onError: (error: Error) => {
            console.error("Failed to remove item from cart:", error);
            setItems(previousItems);
            const errorMessage =
              error?.message || error?.toString() || "Unknown error";
            const mappedError = mapCartErrorMessage(errorMessage);
            const userMessage = t(mappedError.key, mappedError.values);

            if (isNetworkError(error)) {
              toast.error(userMessage, {
                action: {
                  label: t("common:tryAgain"),
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
    },
    [isAuthenticated, removeFromCartMutation, t]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      if (isAuthenticated) {
        const previousItems = [...itemsRef.current];
        setItems((prev) =>
          prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
        );
        debouncedBackendUpdate(productId, quantity, previousItems);
      } else {
        setItems((prev) =>
          prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
        );
      }
    },
    [isAuthenticated, removeFromCart, debouncedBackendUpdate]
  );

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      const previousItems = itemsRef.current;
      setItems([]);

      clearCartMutation.mutate(undefined, {
        onError: (error: Error) => {
          console.error("Failed to clear cart:", error);
          setItems(previousItems);
          const errorMessage =
            error?.message || error?.toString() || "Unknown error";
          const mappedError = mapCartErrorMessage(errorMessage);
          const userMessage = t(mappedError.key, mappedError.values);

          if (isNetworkError(error)) {
            toast.error(userMessage, {
              action: {
                label: t("common:tryAgain"),
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
      setItems([]);
    }
  }, [isAuthenticated, clearCartMutation, t]);

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!isAuthenticated) {
        toast.error(t("cart:errors.applyCouponLogin"));
        return;
      }

      const previousCouponCode = couponCode;
      const previousDiscount = discount;
      setCouponCode(code);

      try {
        await applyCouponMutation.mutateAsync(code);
        toast.success(t("cart:messages.couponApplied"));
      } catch (error: unknown) {
        console.error("Failed to apply coupon:", error);
        setCouponCode(previousCouponCode);
        setDiscount(previousDiscount);
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error) || "Unknown error";
        const mappedError = mapCartErrorMessage(errorMessage, {
          couponCode: code,
        });
        const userMessage = t(mappedError.key, mappedError.values);

        if (isNetworkError(error as Error)) {
          toast.error(userMessage, {
            action: {
              label: t("common:tryAgain"),
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
    [isAuthenticated, couponCode, discount, applyCouponMutation, t]
  );

  const removeCoupon = useCallback(async () => {
    if (!isAuthenticated) return;

    const previousCouponCode = couponCode;
    const previousDiscount = discount;
    setCouponCode(undefined);
    setDiscount(0);

    try {
      await removeCouponMutation.mutateAsync();
      toast.success(t("cart:messages.couponRemoved"));
    } catch (error: unknown) {
      console.error("Failed to remove coupon:", error);
      setCouponCode(previousCouponCode);
      setDiscount(previousDiscount);
      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error) || "Unknown error";
      const mappedError = mapCartErrorMessage(errorMessage);
      const userMessage = t(mappedError.key, mappedError.values);

      if (isNetworkError(error as Error)) {
        toast.error(userMessage, {
          action: {
            label: t("common:tryAgain"),
            onClick: () => {
              removeCoupon();
            },
          },
        });
      } else {
        toast.error(userMessage);
      }
    }
  }, [isAuthenticated, couponCode, discount, removeCouponMutation, t]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const calculatedSubtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const total =
    isAuthenticated && backendCart ? backendCart.total : calculatedSubtotal;
  const finalSubtotal =
    isAuthenticated && backendCart ? backendCart.subtotal : calculatedSubtotal;
  const finalDiscount =
    isAuthenticated && backendCart ? backendCart.discount : 0;
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

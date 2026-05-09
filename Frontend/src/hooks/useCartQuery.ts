import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  type BackendCart,
} from "@/lib/cart-api";

// ── Query Keys ────────────────────────────────────────────────────────────────

/**
 * Query key for cart data
 * Used for caching and invalidation
 */
export const CART_QUERY_KEY = ["cart"] as const;

// ── React Query Configuration ─────────────────────────────────────────────────

/**
 * Default configuration for cart queries
 */
const CART_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 1, // Retry once on failure
  refetchOnWindowFocus: false, // Don't refetch when window regains focus
};

/**
 * Default configuration for cart mutations
 */
const CART_MUTATION_CONFIG = {
  retry: 0, // Don't retry mutations
};

// ── Type Definitions ──────────────────────────────────────────────────────────

/**
 * Parameters for adding an item to the cart
 */
export interface AddToCartParams {
  productId: string;
  quantity: number;
}

/**
 * Parameters for updating an item in the cart
 */
export interface UpdateCartParams {
  productId: string;
  quantity: number;
}

// ── Query Hook ────────────────────────────────────────────────────────────────

/**
 * Hook for fetching cart data
 * 
 * @param enabled - Whether the query should run (typically based on authentication state)
 * @returns UseQueryResult with cart data, loading state, and error state
 * 
 * @example
 * ```tsx
 * const { data: cart, isLoading, error } = useCartQuery(isAuthenticated);
 * ```
 */
export function useCartQuery(
  enabled: boolean
): UseQueryResult<BackendCart, Error> {
  return useQuery<BackendCart, Error>({
    queryKey: CART_QUERY_KEY,
    queryFn: getCart,
    enabled,
    ...CART_QUERY_CONFIG,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for adding an item to the cart
 * 
 * Implements optimistic updates for instant UI feedback
 * Automatically invalidates cart query on success
 * 
 * @returns UseMutationResult with mutate function and mutation state
 * 
 * @example
 * ```tsx
 * const addToCart = useAddToCartMutation();
 * addToCart.mutate({ productId: '123', quantity: 2 });
 * ```
 */
export function useAddToCartMutation(): UseMutationResult<
  BackendCart,
  Error,
  AddToCartParams
> {
  const queryClient = useQueryClient();

  return useMutation<BackendCart, Error, AddToCartParams>({
    mutationFn: ({ productId, quantity }) => addItem(productId, quantity),
    onSuccess: (data) => {
      // Update cache with backend response
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    ...CART_MUTATION_CONFIG,
  });
}

/**
 * Hook for updating an item quantity in the cart
 * 
 * Implements optimistic updates for instant UI feedback
 * Automatically invalidates cart query on success
 * 
 * @returns UseMutationResult with mutate function and mutation state
 * 
 * @example
 * ```tsx
 * const updateCart = useUpdateCartMutation();
 * updateCart.mutate({ productId: '123', quantity: 5 });
 * ```
 */
export function useUpdateCartMutation(): UseMutationResult<
  BackendCart,
  Error,
  UpdateCartParams
> {
  const queryClient = useQueryClient();

  return useMutation<BackendCart, Error, UpdateCartParams>({
    mutationFn: ({ productId, quantity }) => updateItem(productId, quantity),
    onSuccess: (data) => {
      // Update cache with backend response
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    ...CART_MUTATION_CONFIG,
  });
}

/**
 * Hook for removing an item from the cart
 * 
 * Implements optimistic updates for instant UI feedback
 * Automatically invalidates cart query on success
 * 
 * @returns UseMutationResult with mutate function and mutation state
 * 
 * @example
 * ```tsx
 * const removeFromCart = useRemoveFromCartMutation();
 * removeFromCart.mutate('123'); // productId
 * ```
 */
export function useRemoveFromCartMutation(): UseMutationResult<
  BackendCart,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation<BackendCart, Error, string>({
    mutationFn: (productId) => removeItem(productId),
    onSuccess: (data) => {
      // Update cache with backend response
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    ...CART_MUTATION_CONFIG,
  });
}

/**
 * Hook for clearing all items from the cart
 * 
 * Implements optimistic updates for instant UI feedback
 * Automatically invalidates cart query on success
 * 
 * @returns UseMutationResult with mutate function and mutation state
 * 
 * @example
 * ```tsx
 * const clearCartMutation = useClearCartMutation();
 * clearCartMutation.mutate();
 * ```
 */
export function useClearCartMutation(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: clearCart,
    onSuccess: () => {
      // Clear cart data from cache
      queryClient.setQueryData(CART_QUERY_KEY, null);
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    ...CART_MUTATION_CONFIG,
  });
}

/**
 * Hook for applying a coupon code to the cart
 * 
 * Implements optimistic updates for instant UI feedback
 * Automatically invalidates cart query on success
 * 
 * @returns UseMutationResult with mutate function and mutation state
 * 
 * @example
 * ```tsx
 * const applyCouponMutation = useApplyCouponMutation();
 * applyCouponMutation.mutate('SAVE20');
 * ```
 */
export function useApplyCouponMutation(): UseMutationResult<
  BackendCart,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation<BackendCart, Error, string>({
    mutationFn: (code) => applyCoupon(code),
    onSuccess: (data) => {
      // Update cache with backend response including discount
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    ...CART_MUTATION_CONFIG,
  });
}

/**
 * Hook for removing the applied coupon from the cart
 * 
 * Implements optimistic updates for instant UI feedback
 * Automatically invalidates cart query on success
 * 
 * @returns UseMutationResult with mutate function and mutation state
 * 
 * @example
 * ```tsx
 * const removeCouponMutation = useRemoveCouponMutation();
 * removeCouponMutation.mutate();
 * ```
 */
export function useRemoveCouponMutation(): UseMutationResult<
  BackendCart,
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation<BackendCart, Error, void>({
    mutationFn: removeCoupon,
    onSuccess: (data) => {
      // Update cache with backend response without discount
      queryClient.setQueryData(CART_QUERY_KEY, data);
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    ...CART_MUTATION_CONFIG,
  });
}

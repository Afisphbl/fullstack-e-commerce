import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchFeatures,
  fetchFeaturesAdmin,
  createFeature,
  updateFeature,
  deleteFeature,
  type Feature,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const FEATURES_QUERY_KEY = ["features"] as const;
export const FEATURES_ADMIN_QUERY_KEY = ["features", "admin"] as const;

// ── Query Hooks ───────────────────────────────────────────────────────────────

/**
 * Hook for fetching active features (public)
 * 
 * @returns UseQueryResult with features data
 * 
 * @example
 * ```tsx
 * const { data: features, isLoading } = useFeatures();
 * ```
 */
export function useFeatures(): UseQueryResult<Feature[], Error> {
  return useQuery<Feature[], Error>({
    queryKey: FEATURES_QUERY_KEY,
    queryFn: fetchFeatures,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching all features (admin)
 * 
 * @returns UseQueryResult with all features data
 * 
 * @example
 * ```tsx
 * const { data: features, isLoading } = useFeaturesAdmin();
 * ```
 */
export function useFeaturesAdmin(): UseQueryResult<Feature[], Error> {
  return useQuery<Feature[], Error>({
    queryKey: FEATURES_ADMIN_QUERY_KEY,
    queryFn: fetchFeaturesAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for creating a feature
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const createFeatureMutation = useCreateFeature();
 * createFeatureMutation.mutate({ title: 'Fast Shipping', icon: 'Truck' });
 * ```
 */
export function useCreateFeature(): UseMutationResult<
  Feature,
  Error,
  Partial<Feature>
> {
  const queryClient = useQueryClient();

  return useMutation<Feature, Error, Partial<Feature>>({
    mutationFn: createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURES_ADMIN_QUERY_KEY });
    },
  });
}

/**
 * Hook for updating a feature
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const updateFeatureMutation = useUpdateFeature();
 * updateFeatureMutation.mutate({ id: '123', data: { title: 'Updated' } });
 * ```
 */
export function useUpdateFeature(): UseMutationResult<
  Feature,
  Error,
  { id: string; data: Partial<Feature> }
> {
  const queryClient = useQueryClient();

  return useMutation<Feature, Error, { id: string; data: Partial<Feature> }>({
    mutationFn: ({ id, data }) => updateFeature(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURES_ADMIN_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting a feature
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const deleteFeatureMutation = useDeleteFeature();
 * deleteFeatureMutation.mutate('123');
 * ```
 */
export function useDeleteFeature(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEATURES_ADMIN_QUERY_KEY });
    },
  });
}

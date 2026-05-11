import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchFAQsFromAPI,
  fetchFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  type FAQExtended,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const FAQS_QUERY_KEY = ["faqs"] as const;
export const FAQS_ADMIN_QUERY_KEY = ["faqs", "admin"] as const;

// ── Query Hooks ───────────────────────────────────────────────────────────────

/**
 * Hook for fetching active FAQs (public)
 * 
 * @returns UseQueryResult with FAQs data
 * 
 * @example
 * ```tsx
 * const { data: faqs, isLoading } = useFAQs();
 * ```
 */
export function useFAQs(): UseQueryResult<FAQExtended[], Error> {
  return useQuery<FAQExtended[], Error>({
    queryKey: FAQS_QUERY_KEY,
    queryFn: fetchFAQsFromAPI,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching all FAQs (admin)
 * 
 * @returns UseQueryResult with all FAQs data
 * 
 * @example
 * ```tsx
 * const { data: faqs, isLoading } = useFAQsAdmin();
 * ```
 */
export function useFAQsAdmin(): UseQueryResult<FAQExtended[], Error> {
  return useQuery<FAQExtended[], Error>({
    queryKey: FAQS_ADMIN_QUERY_KEY,
    queryFn: fetchFAQsAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for creating a FAQ
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const createFAQMutation = useCreateFAQ();
 * createFAQMutation.mutate({ question: '...', answer: '...' });
 * ```
 */
export function useCreateFAQ(): UseMutationResult<
  FAQExtended,
  Error,
  Partial<FAQExtended>
> {
  const queryClient = useQueryClient();

  return useMutation<FAQExtended, Error, Partial<FAQExtended>>({
    mutationFn: createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FAQS_ADMIN_QUERY_KEY });
    },
  });
}

/**
 * Hook for updating a FAQ
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const updateFAQMutation = useUpdateFAQ();
 * updateFAQMutation.mutate({ id: '123', data: { answer: 'Updated' } });
 * ```
 */
export function useUpdateFAQ(): UseMutationResult<
  FAQExtended,
  Error,
  { id: string; data: Partial<FAQExtended> }
> {
  const queryClient = useQueryClient();

  return useMutation<FAQExtended, Error, { id: string; data: Partial<FAQExtended> }>({
    mutationFn: ({ id, data }) => updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FAQS_ADMIN_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting a FAQ
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const deleteFAQMutation = useDeleteFAQ();
 * deleteFAQMutation.mutate('123');
 * ```
 */
export function useDeleteFAQ(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FAQS_ADMIN_QUERY_KEY });
    },
  });
}

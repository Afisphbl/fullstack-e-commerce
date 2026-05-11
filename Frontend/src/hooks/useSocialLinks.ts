import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  type SocialLink,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const SOCIAL_LINKS_QUERY_KEY = ["socialLinks"] as const;

// ── Query Hook ────────────────────────────────────────────────────────────────

/**
 * Hook for fetching social links
 * 
 * @returns UseQueryResult with social links data
 * 
 * @example
 * ```tsx
 * const { data: links, isLoading } = useSocialLinks();
 * ```
 */
export function useSocialLinks(): UseQueryResult<SocialLink[], Error> {
  return useQuery<SocialLink[], Error>({
    queryKey: SOCIAL_LINKS_QUERY_KEY,
    queryFn: fetchSocialLinks,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for creating a social link
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const createLink = useCreateSocialLink();
 * createLink.mutate({ platform: 'facebook', url: '...' });
 * ```
 */
export function useCreateSocialLink(): UseMutationResult<
  SocialLink,
  Error,
  Partial<SocialLink>
> {
  const queryClient = useQueryClient();

  return useMutation<SocialLink, Error, Partial<SocialLink>>({
    mutationFn: createSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_QUERY_KEY });
    },
  });
}

/**
 * Hook for updating a social link
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const updateLink = useUpdateSocialLink();
 * updateLink.mutate({ id: '123', data: { url: 'new-url' } });
 * ```
 */
export function useUpdateSocialLink(): UseMutationResult<
  SocialLink,
  Error,
  { id: string; data: Partial<SocialLink> }
> {
  const queryClient = useQueryClient();

  return useMutation<SocialLink, Error, { id: string; data: Partial<SocialLink> }>({
    mutationFn: ({ id, data }) => updateSocialLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting a social link
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const deleteLink = useDeleteSocialLink();
 * deleteLink.mutate('123');
 * ```
 */
export function useDeleteSocialLink(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_QUERY_KEY });
    },
  });
}

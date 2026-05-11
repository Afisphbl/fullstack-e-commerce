import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchSEOSettings,
  updateSEOSettings,
  uploadOGImage,
  type SEOSettings,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const SEO_SETTINGS_QUERY_KEY = (page: string) => ["seoSettings", page] as const;

// ── Query Hook ────────────────────────────────────────────────────────────────

/**
 * Hook for fetching SEO settings for a page
 * 
 * @param page - Page identifier
 * @returns UseQueryResult with SEO settings data
 * 
 * @example
 * ```tsx
 * const { data: seo, isLoading } = useSEOSettings('home');
 * ```
 */
export function useSEOSettings(page: string): UseQueryResult<SEOSettings, Error> {
  return useQuery<SEOSettings, Error>({
    queryKey: SEO_SETTINGS_QUERY_KEY(page),
    queryFn: () => fetchSEOSettings(page),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !!page,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for updating SEO settings
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const updateSEO = useUpdateSEOSettings();
 * updateSEO.mutate({ page: 'home', data: { metaTitle: '...' } });
 * ```
 */
export function useUpdateSEOSettings(): UseMutationResult<
  SEOSettings,
  Error,
  { page: string; data: Partial<SEOSettings> }
> {
  const queryClient = useQueryClient();

  return useMutation<
    SEOSettings,
    Error,
    { page: string; data: Partial<SEOSettings> }
  >({
    mutationFn: ({ page, data }) => updateSEOSettings(page, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(SEO_SETTINGS_QUERY_KEY(variables.page), data);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: SEO_SETTINGS_QUERY_KEY(variables.page) });
    },
  });
}

/**
 * Hook for uploading OG image
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const uploadOG = useUploadOGImage();
 * uploadOG.mutate({ page: 'home', file });
 * ```
 */
export function useUploadOGImage(): UseMutationResult<
  SEOSettings,
  Error,
  { page: string; file: File }
> {
  const queryClient = useQueryClient();

  return useMutation<SEOSettings, Error, { page: string; file: File }>({
    mutationFn: ({ page, file }) => uploadOGImage(page, file),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(SEO_SETTINGS_QUERY_KEY(variables.page), data);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: SEO_SETTINGS_QUERY_KEY(variables.page) });
    },
  });
}

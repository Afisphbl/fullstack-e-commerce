import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchSiteSettings,
  updateSiteSettings,
  uploadLogo,
  uploadFavicon,
  type SiteSettings,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const SITE_SETTINGS_QUERY_KEY = ["siteSettings"] as const;

// ── Query Hook ────────────────────────────────────────────────────────────────

/**
 * Hook for fetching site settings
 * 
 * @returns UseQueryResult with site settings data
 * 
 * @example
 * ```tsx
 * const { data: settings, isLoading, error } = useSiteSettings();
 * ```
 */
export function useSiteSettings(): UseQueryResult<SiteSettings, Error> {
  return useQuery<SiteSettings, Error>({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for updating site settings
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const updateSettings = useUpdateSiteSettings();
 * updateSettings.mutate({ siteName: 'New Name' });
 * ```
 */
export function useUpdateSiteSettings(): UseMutationResult<
  SiteSettings,
  Error,
  Partial<SiteSettings>
> {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, Error, Partial<SiteSettings>>({
    mutationFn: updateSiteSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    },
  });
}

/**
 * Hook for uploading logo
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const uploadLogoMutation = useUploadLogo();
 * uploadLogoMutation.mutate(file);
 * ```
 */
export function useUploadLogo(): UseMutationResult<SiteSettings, Error, File> {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, Error, File>({
    mutationFn: uploadLogo,
    onSuccess: (data) => {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    },
  });
}

/**
 * Hook for uploading favicon
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const uploadFaviconMutation = useUploadFavicon();
 * uploadFaviconMutation.mutate(file);
 * ```
 */
export function useUploadFavicon(): UseMutationResult<SiteSettings, Error, File> {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, Error, File>({
    mutationFn: uploadFavicon,
    onSuccess: (data) => {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    },
  });
}

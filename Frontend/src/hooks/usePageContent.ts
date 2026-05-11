import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchPageContent,
  updatePageContent,
  uploadSectionImage,
  type PageContent,
  type PageContentSection,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const PAGE_CONTENT_QUERY_KEY = (page: string) => ["pageContent", page] as const;

// ── Query Hook ────────────────────────────────────────────────────────────────

/**
 * Hook for fetching page content
 * 
 * @param page - Page identifier (home, about, contact, faq)
 * @returns UseQueryResult with page content data
 * 
 * @example
 * ```tsx
 * const { data: content, isLoading } = usePageContent('home');
 * ```
 */
export function usePageContent(page: string): UseQueryResult<PageContent, Error> {
  return useQuery<PageContent, Error>({
    queryKey: PAGE_CONTENT_QUERY_KEY(page),
    queryFn: () => fetchPageContent(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!page,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for updating page content
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const updateContent = useUpdatePageContent();
 * updateContent.mutate({ page: 'home', sections: [...] });
 * ```
 */
export function useUpdatePageContent(): UseMutationResult<
  PageContent,
  Error,
  { page: string; sections: PageContentSection[] }
> {
  const queryClient = useQueryClient();

  return useMutation<
    PageContent,
    Error,
    { page: string; sections: PageContentSection[] }
  >({
    mutationFn: ({ page, sections }) => updatePageContent(page, { sections }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(PAGE_CONTENT_QUERY_KEY(variables.page), data);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: PAGE_CONTENT_QUERY_KEY(variables.page) });
    },
  });
}

/**
 * Hook for uploading section image
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const uploadImage = useUploadSectionImage();
 * uploadImage.mutate({ page: 'home', sectionKey: 'hero', file });
 * ```
 */
export function useUploadSectionImage(): UseMutationResult<
  PageContent,
  Error,
  { page: string; sectionKey: string; file: File }
> {
  const queryClient = useQueryClient();

  return useMutation<
    PageContent,
    Error,
    { page: string; sectionKey: string; file: File }
  >({
    mutationFn: ({ page, sectionKey, file }) =>
      uploadSectionImage(page, sectionKey, file),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(PAGE_CONTENT_QUERY_KEY(variables.page), data);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: PAGE_CONTENT_QUERY_KEY(variables.page) });
    },
  });
}

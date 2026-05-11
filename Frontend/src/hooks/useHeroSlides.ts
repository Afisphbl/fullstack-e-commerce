import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchHeroSlides,
  fetchHeroSlidesAdmin,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  type HeroSlide,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const HERO_SLIDES_QUERY_KEY = ["heroSlides"] as const;
export const HERO_SLIDES_ADMIN_QUERY_KEY = ["heroSlides", "admin"] as const;

// ── Query Hooks ───────────────────────────────────────────────────────────────

/**
 * Hook for fetching active hero slides (public)
 * 
 * @returns UseQueryResult with hero slides data
 * 
 * @example
 * ```tsx
 * const { data: slides, isLoading } = useHeroSlides();
 * ```
 */
export function useHeroSlides(): UseQueryResult<HeroSlide[], Error> {
  return useQuery<HeroSlide[], Error>({
    queryKey: HERO_SLIDES_QUERY_KEY,
    queryFn: fetchHeroSlides,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching all hero slides (admin)
 * 
 * @returns UseQueryResult with all hero slides data
 * 
 * @example
 * ```tsx
 * const { data: slides, isLoading } = useHeroSlidesAdmin();
 * ```
 */
export function useHeroSlidesAdmin(): UseQueryResult<HeroSlide[], Error> {
  return useQuery<HeroSlide[], Error>({
    queryKey: HERO_SLIDES_ADMIN_QUERY_KEY,
    queryFn: fetchHeroSlidesAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

// ── Mutation Hooks ────────────────────────────────────────────────────────────

/**
 * Hook for creating a hero slide
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const createSlide = useCreateHeroSlide();
 * createSlide.mutate(formData);
 * ```
 */
export function useCreateHeroSlide(): UseMutationResult<
  HeroSlide,
  Error,
  FormData | Partial<HeroSlide>
> {
  const queryClient = useQueryClient();

  return useMutation<HeroSlide, Error, FormData | Partial<HeroSlide>>({
    mutationFn: createHeroSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_ADMIN_QUERY_KEY });
    },
  });
}

/**
 * Hook for updating a hero slide
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const updateSlide = useUpdateHeroSlide();
 * updateSlide.mutate({ id: '123', data: formData });
 * ```
 */
export function useUpdateHeroSlide(): UseMutationResult<
  HeroSlide,
  Error,
  { id: string; data: FormData | Partial<HeroSlide> }
> {
  const queryClient = useQueryClient();

  return useMutation<
    HeroSlide,
    Error,
    { id: string; data: FormData | Partial<HeroSlide> }
  >({
    mutationFn: ({ id, data }) => updateHeroSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_ADMIN_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting a hero slide
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const deleteSlide = useDeleteHeroSlide();
 * deleteSlide.mutate('123');
 * ```
 */
export function useDeleteHeroSlide(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteHeroSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_ADMIN_QUERY_KEY });
    },
  });
}

/**
 * Hook for reordering hero slides
 * 
 * @returns UseMutationResult with mutate function
 * 
 * @example
 * ```tsx
 * const reorderSlide = useReorderHeroSlides();
 * reorderSlide.mutate({ id: '123', newOrder: 2 });
 * ```
 */
export function useReorderHeroSlides(): UseMutationResult<
  HeroSlide,
  Error,
  { id: string; newOrder: number }
> {
  const queryClient = useQueryClient();

  return useMutation<HeroSlide, Error, { id: string; newOrder: number }>({
    mutationFn: ({ id, newOrder }) => reorderHeroSlides(id, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HERO_SLIDES_ADMIN_QUERY_KEY });
    },
  });
}

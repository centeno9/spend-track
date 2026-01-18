import { useQuery } from "@tanstack/react-query";
import { fetchTags } from "@/shared/api/tags.api";

export const TAGS_QUERY_KEY = ["tags"] as const;

/**
 * Hook to fetch user tags with caching
 *
 * Cache strategy:
 * - Data stays fresh for 5 minutes
 * - Manual invalidation on mutations for instant updates
 */
export function useTags() {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

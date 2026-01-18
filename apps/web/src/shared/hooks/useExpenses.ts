import { useQuery } from "@tanstack/react-query";
import { fetchExpenses } from "@/shared/api/expenses.api";
import type { ExpensesQueryParams } from "@/shared/types/expense.types";

/**
 * Hook to fetch expenses with caching
 *
 * Cache strategy:
 * - Data stays fresh for 5 minutes
 * - After 5 min, background refetch on next mount
 * - Manual invalidation on mutations for instant updates
 */
export function useExpenses(params: ExpensesQueryParams = {}) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => fetchExpenses(params),

    // Fresh for 5 minutes, then background refetch
    staleTime: 5 * 60 * 1000,

    // Keep cache for 10 min after unmount (smooth navigation)
    gcTime: 10 * 60 * 1000,

    // Don't refetch on window focus (5 min staleTime is enough)
    refetchOnWindowFocus: false,

    // Retry failed requests twice
    retry: 2,
  });
}

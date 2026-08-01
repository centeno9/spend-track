import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateExpensePayload } from "@/shared/types/expense.types";
import { bulkCreateExpenses } from "../api/import.api";

/**
 * Hook to create many expenses at once, invalidating the expenses cache so the
 * dashboard and list views refetch.
 */
export function useBulkCreateExpenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenses: CreateExpensePayload[]) =>
      bulkCreateExpenses(expenses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

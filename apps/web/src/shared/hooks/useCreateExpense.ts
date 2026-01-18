import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/shared/api/expenses.api";
import type { CreateExpensePayload } from "@/shared/types/expense.types";

/**
 * Hook to create a new expense with cache invalidation
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      // Invalidate all expense queries to refetch with new data
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

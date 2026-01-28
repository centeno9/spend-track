import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpense } from "@/shared/api/expenses.api";

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

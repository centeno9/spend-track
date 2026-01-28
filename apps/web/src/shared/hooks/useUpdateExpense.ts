import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpense } from "@/shared/api/expenses.api";
import type { UpdateExpensePayload } from "@/shared/types/expense.types";

interface UpdateExpenseVariables {
  id: string;
  payload: UpdateExpensePayload;
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateExpenseVariables) =>
      updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

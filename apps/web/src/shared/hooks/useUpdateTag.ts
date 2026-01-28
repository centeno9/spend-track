import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTag } from "@/shared/api/tags.api";
import { TAGS_QUERY_KEY } from "./useTags";
import type { UpdateTagPayload } from "@/shared/types/expense.types";

interface UpdateTagVariables {
  id: string;
  payload: UpdateTagPayload;
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTagVariables) => updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
      // Also invalidate expenses since they display tag info
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTag } from "@/shared/api/tags.api";
import { TAGS_QUERY_KEY } from "./useTags";

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
      // Also invalidate expenses since they may reference the deleted tag
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

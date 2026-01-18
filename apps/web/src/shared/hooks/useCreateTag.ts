import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTag } from "@/shared/api/tags.api";
import { TAGS_QUERY_KEY } from "./useTags";
import type { CreateTagPayload, Tag } from "@/shared/types/expense.types";

/**
 * Hook to create a new tag with optimistic update
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagPayload) => createTag(payload),
    onMutate: async (newTag) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TAGS_QUERY_KEY });

      // Snapshot previous value
      const previousTags = queryClient.getQueryData<Tag[]>(TAGS_QUERY_KEY);

      // Optimistically add new tag with temporary id
      if (previousTags) {
        const optimisticTag: Tag = {
          id: `temp-${Date.now()}`,
          name: newTag.name,
          color: newTag.color,
          userId: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Tag[]>(TAGS_QUERY_KEY, [
          ...previousTags,
          optimisticTag,
        ]);
      }

      return { previousTags };
    },
    onError: (_err, _newTag, context) => {
      // Rollback on error
      if (context?.previousTags) {
        queryClient.setQueryData(TAGS_QUERY_KEY, context.previousTags);
      }
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

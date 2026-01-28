"use client";

import { TagFilter as BaseTagFilter } from "@/shared/components/TagFilter";
import { useExpenseFiltersStore } from "../providers/expense-filters.provider";

export const TagFilter = () => {
  const selectedTagIds = useExpenseFiltersStore((state) => state.tagsId);
  const setTags = useExpenseFiltersStore((state) => state.setTags);

  return (
    <BaseTagFilter
      selectedTagIds={selectedTagIds}
      onTagsChange={setTags}
      className="mb-6"
    />
  );
};

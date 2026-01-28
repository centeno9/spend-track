"use client";

import { Check, Tag as TagIcon } from "lucide-react";
import { useTags } from "@/shared/hooks/useTags";
import { cn } from "@/shared/lib/utils";
import type { Tag } from "@/shared/types/expense.types";

interface TagFilterProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  className?: string;
}

export function TagFilter({
  selectedTagIds,
  onTagsChange,
  className,
}: TagFilterProps) {
  const { data: tags = [], isLoading } = useTags();

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2",
          className
        )}
      >
        <TagIcon size={14} className="text-gray-400" />
        <span className="text-sm text-gray-400">Loading tags...</span>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 flex-wrap",
        className
      )}
    >
      <div className="flex items-center gap-1 text-gray-500 mr-1">
        <TagIcon size={14} />
        <span className="text-xs font-medium hidden sm:inline">Filter:</span>
      </div>

      {tags.map((tag: Tag) => (
        <button
          key={tag.id}
          onClick={() => toggleTag(tag.id)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
            selectedTagIds.includes(tag.id)
              ? "border-transparent text-white shadow-sm"
              : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
          )}
          style={{
            backgroundColor: selectedTagIds.includes(tag.id)
              ? tag.color
              : undefined,
          }}
        >
          {tag.name}
          {selectedTagIds.includes(tag.id) && (
            <Check size={10} className="inline ml-1" />
          )}
        </button>
      ))}

      {selectedTagIds.length > 0 && (
        <button
          onClick={clearTags}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}

"use client";

import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Tag } from "@/shared/types/expense.types";

interface TagPillProps {
  tag: Tag;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function TagPill({ tag, selected, onClick, disabled }: TagPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium border transition-all disabled:opacity-50",
        selected
          ? "border-transparent text-white shadow-sm"
          : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 bg-background"
      )}
      style={{ backgroundColor: selected ? tag.color : undefined }}
    >
      {tag.name}
      {selected && <Check size={12} className="inline ml-1" />}
    </button>
  );
}

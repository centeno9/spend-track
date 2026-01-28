"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCreateTag } from "@/shared/hooks/useCreateTag";
import { useUpdateTag } from "@/shared/hooks/useUpdateTag";
import { cn } from "@/shared/lib/utils";
import type { Tag } from "@/shared/types/expense.types";

const PRESET_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#84CC16", // Lime
  "#22C55E", // Green
  "#14B8A6", // Teal
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#6B7280", // Gray
] as const;

interface TagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag; // If provided, modal is in edit mode
}

export function TagModal({ open, onOpenChange, tag }: TagModalProps) {
  const isEditMode = !!tag;

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState("");

  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (tag) {
        // Edit mode - populate with existing tag data
        setName(tag.name);
        setColor(tag.color);
        // Check if it's a custom color
        if (!PRESET_COLORS.includes(tag.color as typeof PRESET_COLORS[number])) {
          setCustomColor(tag.color);
        } else {
          setCustomColor("");
        }
      } else {
        // Create mode - reset to defaults
        setName("");
        setColor(PRESET_COLORS[0]);
        setCustomColor("");
      }
    }
  }, [open, tag]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) return;

      try {
        if (isEditMode && tag) {
          await updateTag.mutateAsync({
            id: tag.id,
            payload: {
              name: name.trim(),
              color: color,
            },
          });
        } else {
          await createTag.mutateAsync({
            name: name.trim(),
            color: color,
          });
        }
        onOpenChange(false);
      } catch {
        // Error handling can be enhanced with toast notifications
      }
    },
    [name, color, isEditMode, tag, createTag, updateTag, onOpenChange]
  );

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    // Only set as active color if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setColor(value);
    }
  };

  const isSubmitting = createTag.isPending || updateTag.isPending;
  const isPresetColor = PRESET_COLORS.includes(color as typeof PRESET_COLORS[number]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Tag" : "Create New Tag"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tag name..."
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>

            {/* Preset colors */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => {
                    setColor(presetColor);
                    setCustomColor("");
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all disabled:opacity-50",
                    color === presetColor
                      ? "ring-2 ring-offset-2 ring-ring scale-110"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: presetColor }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>

            {/* Custom color input */}
            <div className="flex items-center gap-2 mt-3">
              <Label htmlFor="custom-color" className="text-sm text-muted-foreground whitespace-nowrap">
                Custom:
              </Label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  id="custom-color"
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#000000"
                  maxLength={7}
                  className="font-mono h-8 w-28"
                  disabled={isSubmitting}
                />
                <input
                  type="color"
                  value={customColor || color}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setColor(e.target.value);
                  }}
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded cursor-pointer border border-input disabled:opacity-50"
                />
                {!isPresetColor && (
                  <div
                    className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-ring"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Preview</Label>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: color }}
              >
                {name.trim() ? name.trim()[0].toUpperCase() : "T"}
              </div>
              <span className="font-medium">
                {name.trim() || "Tag name"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting
                ? isEditMode ? "Saving..." : "Creating..."
                : isEditMode ? "Save Changes" : "Create Tag"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useTags } from "@/shared/hooks/useTags";
import { useCreateExpense } from "@/shared/hooks/useCreateExpense";
import { useCreateTag } from "@/shared/hooks/useCreateTag";
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

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
  // Form state
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Tag creation state
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState<string>(PRESET_COLORS[0]);

  // Hooks
  const { data: tags = [], isLoading: tagsLoading } = useTags();
  const createExpense = useCreateExpense();
  const createTag = useCreateTag();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAmount("");
      setTitle("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setSelectedTagIds([]);
      setIsCreatingTag(false);
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[0]);
    }
  }, [open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!amount || !title || !date) return;

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return;

      try {
        await createExpense.mutateAsync({
          total: parsedAmount,
          title: title.trim(),
          expensedAt: date,
          description: description.trim() || undefined,
          tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        });
        onOpenChange(false);
      } catch {
        // Error handling can be enhanced with toast notifications
      }
    },
    [amount, title, date, description, selectedTagIds, createExpense, onOpenChange]
  );

  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor,
      });
      // Auto-select the newly created tag
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[0]);
      setIsCreatingTag(false);
    } catch {
      // Error handling can be enhanced with toast notifications
    }
  }, [newTagName, newTagColor, createTag]);

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const isSubmitting = createExpense.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lunch, Uber, Software..."
              disabled={isSubmitting}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tagsLoading ? (
                <span className="text-sm text-muted-foreground">Loading tags...</span>
              ) : (
                <>
                  {tags.map((tag: Tag) => (
                    <TagButton
                      key={tag.id}
                      tag={tag}
                      isSelected={selectedTagIds.includes(tag.id)}
                      onClick={() => toggleTag(tag.id)}
                      disabled={isSubmitting}
                    />
                  ))}

                  {!isCreatingTag ? (
                    <button
                      type="button"
                      onClick={() => setIsCreatingTag(true)}
                      disabled={isSubmitting}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-muted-foreground/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/60 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Plus size={12} />
                      New Tag
                    </button>
                  ) : (
                    <NewTagForm
                      name={newTagName}
                      color={newTagColor}
                      onNameChange={setNewTagName}
                      onColorChange={setNewTagColor}
                      onSubmit={handleCreateTag}
                      onCancel={() => {
                        setIsCreatingTag(false);
                        setNewTagName("");
                        setNewTagColor(PRESET_COLORS[0]);
                      }}
                      isLoading={createTag.isPending}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={256}
              rows={3}
              placeholder="Add details..."
              disabled={isSubmitting}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !amount || !title}
          >
            {isSubmitting ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Tag button component
interface TagButtonProps {
  tag: Tag;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function TagButton({ tag, isSelected, onClick, disabled }: TagButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium border transition-all disabled:opacity-50",
        isSelected
          ? "border-transparent text-white shadow-sm"
          : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 bg-background"
      )}
      style={{
        backgroundColor: isSelected ? tag.color : undefined,
      }}
    >
      {tag.name}
      {isSelected && <Check size={12} className="inline ml-1" />}
    </button>
  );
}

// New tag form component
interface NewTagFormProps {
  name: string;
  color: string;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function NewTagForm({
  name,
  color,
  onNameChange,
  onColorChange,
  onSubmit,
  onCancel,
  isLoading,
}: NewTagFormProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/30 w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Tag name"
          maxLength={50}
          className="h-8 text-sm flex-1"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
            if (e.key === "Escape") {
              onCancel();
            }
          }}
          autoFocus
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!name.trim() || isLoading}
          className="p-1.5 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Color palette */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            onClick={() => onColorChange(presetColor)}
            disabled={isLoading}
            className={cn(
              "w-6 h-6 rounded-full transition-all disabled:opacity-50",
              color === presetColor
                ? "ring-2 ring-offset-2 ring-ring scale-110"
                : "hover:scale-110"
            )}
            style={{ backgroundColor: presetColor }}
            aria-label={`Select color ${presetColor}`}
          />
        ))}
      </div>
    </div>
  );
}

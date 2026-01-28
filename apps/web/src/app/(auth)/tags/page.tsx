"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { TagModal } from "@/shared/components/TagModal";
import { useTags } from "@/shared/hooks/useTags";
import { useDeleteTag } from "@/shared/hooks/useDeleteTag";
import type { Tag } from "@/shared/types/expense.types";

export default function TagsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const { data: tags = [], isLoading, error } = useTags();
  const deleteTag = useDeleteTag();

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    await deleteTag.mutateAsync(tagToDelete.id);
    setTagToDelete(null);
  };

  return (
    <div className="p-4 md:p-8 flex-1">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-sm text-gray-500 mt-1">
            Categorize your spending with tags
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          Create Tag
        </Button>
      </header>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : tags.length === 0 ? (
        <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
      ) : (
        <TagGrid
          tags={tags}
          onEditClick={setTagToEdit}
          onDeleteClick={setTagToDelete}
        />
      )}

      {/* Create Modal */}
      <TagModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Edit Modal */}
      <TagModal
        open={!!tagToEdit}
        onOpenChange={(open) => !open && setTagToEdit(null)}
        tag={tagToEdit ?? undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">
                Are you sure you want to delete &quot;{tagToDelete?.name}&quot;?
              </span>
              <span className="block text-amber-600 font-medium">
                Warning: All expenses with this tag will lose it. The expenses themselves will not be deleted.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTagToDelete(null)}
              disabled={deleteTag.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTag.isPending}
            >
              {deleteTag.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tag Grid Component
function TagGrid({
  tags,
  onEditClick,
  onDeleteClick,
}: {
  tags: Tag[];
  onEditClick: (tag: Tag) => void;
  onDeleteClick: (tag: Tag) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tags.map((tag) => (
        <TagCard
          key={tag.id}
          tag={tag}
          onEditClick={() => onEditClick(tag)}
          onDeleteClick={() => onDeleteClick(tag)}
        />
      ))}
    </div>
  );
}

// Tag Card Component
function TagCard({
  tag,
  onEditClick,
  onDeleteClick,
}: {
  tag: Tag;
  onEditClick: () => void;
  onDeleteClick: () => void;
}) {
  const initial = tag.name.trim()[0]?.toUpperCase() || "T";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* Color Circle with Initial */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        style={{ backgroundColor: tag.color }}
      >
        {initial}
      </div>

      {/* Tag Name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{tag.name}</h3>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditClick}
          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteClick}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 animate-pulse"
        >
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Error State
function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-center text-red-400">
        Error loading tags: {message}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No tags yet</h3>
      <p className="text-sm text-gray-500 mb-4">
        Create tags to categorize and organize your expenses.
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-gray-900 hover:bg-black text-white"
      >
        <Plus size={16} className="mr-2" />
        Create Tag
      </Button>
    </div>
  );
}

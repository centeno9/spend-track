"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { AddExpenseModal } from "@/shared/components/AddExpenseModal";
import { TagFilter } from "@/shared/components/TagFilter";
import { fetchExpenses } from "@/shared/api/expenses.api";
import { useDeleteExpense } from "@/shared/hooks/useDeleteExpense";
import { formatCurrency } from "@/shared/lib/currency.utils";
import { parseLocalDate } from "@/shared/lib/date.utils";
import type { Expense } from "@/shared/types/expense.types";

const ITEMS_PER_PAGE = 20;

export default function ExpensesPage() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch expenses with separate query from dashboard
  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses", "list", { page: currentPage, tagIds: selectedTagIds }],
    queryFn: () =>
      fetchExpenses({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        sortOrder: "desc",
      }),
    staleTime: 5 * 60 * 1000,
  });

  // Reset to page 1 when filters change
  const handleTagsChange = (tagIds: string[]) => {
    setSelectedTagIds(tagIds);
    setCurrentPage(1);
  };

  const expenses = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="p-4 md:p-8 flex-1">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your expenses
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          New Expense
        </Button>
      </header>

      {/* Filters */}
      <TagFilter
        selectedTagIds={selectedTagIds}
        onTagsChange={handleTagsChange}
        className="mb-6"
      />

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : expenses.length === 0 ? (
        <EmptyState onCreateClick={() => setIsModalOpen(true)} />
      ) : (
        <>
          <ExpenseList expenses={expenses} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Modal */}
      <AddExpenseModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}

// Expense List Component
function ExpenseList({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-100">
        {expenses.map((expense) => (
          <ExpenseRow key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
}

// Individual Expense Row
function ExpenseRow({ expense }: { expense: Expense }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteExpense = useDeleteExpense();

  const date = parseLocalDate(expense.expensedAt.split("T")[0]);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    await deleteExpense.mutateAsync(expense.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-900 truncate">{expense.title}</h3>
            {expense.tags.length > 0 && (
              <div className="flex gap-1.5 flex-shrink-0">
                {expense.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
                {expense.tags.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                    +{expense.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          {expense.description && (
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {expense.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(expense.total)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{expense.title}&quot; ({formatCurrency(expense.total)})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteExpense.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteExpense.isPending}
            >
              {deleteExpense.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3"
      >
        Previous
      </Button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className="w-9"
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3"
      >
        Next
      </Button>
    </div>
  );
}

// Helper to generate page numbers with ellipsis
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

// Loading State
function LoadingState() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-center text-gray-400">
        Loading expenses...
      </div>
    </div>
  );
}

// Error State
function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-center text-red-400">
        Error loading expenses: {message}
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
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses yet</h3>
      <p className="text-sm text-gray-500 mb-4">
        Start tracking your spending by adding your first expense.
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-gray-900 hover:bg-black text-white"
      >
        <Plus size={16} className="mr-2" />
        Add Expense
      </Button>
    </div>
  );
}

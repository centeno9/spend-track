"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTags } from "@/shared/hooks/useTags";
import { useImportStore } from "../providers/import.provider";
import { useBulkCreateExpenses } from "../hooks/useBulkCreateExpenses";
import { ImportExpense } from "../domain/import-expense";
import { ImportExpenseRow } from "./ImportExpenseRow";
import { TagPill } from "./TagPill";

export function ImportPreview() {
  const expenses = useImportStore((state) => state.expenses);
  const status = useImportStore((state) => state.status);
  const errorMessage = useImportStore((state) => state.errorMessage);
  const setStatus = useImportStore((state) => state.setStatus);
  const setError = useImportStore((state) => state.setError);
  const applyTagsToAll = useImportStore((state) => state.applyTagsToAll);
  const reset = useImportStore((state) => state.reset);

  const { data: tags = [], isLoading: tagsLoading } = useTags();
  const bulkCreate = useBulkCreateExpenses();

  const [bulkTagIds, setBulkTagIds] = useState<string[]>([]);
  const isSubmitting = status === "submitting";

  const totalCents = expenses.reduce(
    (sum, expense) => sum + expense.totalCents,
    0
  );

  const toggleBulkTag = (tagId: string) => {
    setBulkTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleImport = async () => {
    const payloads = expenses.map((expense) => expense.toPayload());
    const hasInvalid = payloads.some(
      (payload) => !payload.expensedAt || !(payload.total > 0)
    );

    if (hasInvalid) {
      setError(
        "Every expense needs a valid date and a positive amount before importing."
      );
      return;
    }

    setError(null);
    setStatus("submitting");

    try {
      await bulkCreate.mutateAsync(payloads);
      setStatus("done");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to import expenses"
      );
      setStatus("ready");
    }
  };

  return (
    <div className="space-y-6">
      {/* Apply tags to all */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-medium">Apply tags to all</p>
            <p className="text-xs text-gray-500">
              Select tags, then apply them to every charge below.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTagsToAll(bulkTagIds)}
            disabled={isSubmitting || bulkTagIds.length === 0}
          >
            Apply to all
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tagsLoading ? (
            <span className="text-sm text-muted-foreground">
              Loading tags...
            </span>
          ) : (
            tags.map((tag) => (
              <TagPill
                key={tag.id}
                tag={tag}
                selected={bulkTagIds.includes(tag.id)}
                disabled={isSubmitting}
                onClick={() => toggleBulkTag(tag.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Preview list */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
        {expenses.map((expense) => (
          <ImportExpenseRow
            key={expense.id}
            expense={expense}
            tags={tags}
            disabled={isSubmitting}
          />
        ))}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      {/* Sticky action bar: spans the full content width, pinned to the bottom
          of the main container while the list scrolls. */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">
              {ImportExpense.formatCents(totalCents)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={reset} disabled={isSubmitting}>
              <ArrowLeft size={16} className="mr-1" />
              Start over
            </Button>
            <Button
              onClick={handleImport}
              disabled={isSubmitting}
              className="bg-gray-900 hover:bg-black text-white"
            >
              {isSubmitting
                ? "Importing..."
                : `Import ${expenses.length} expense${
                    expenses.length === 1 ? "" : "s"
                  }`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

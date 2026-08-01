"use client";

import { Input } from "@/shared/components/ui/input";
import type { Tag } from "@/shared/types/expense.types";
import type { ImportExpense } from "../domain/import-expense";
import { useImportStore } from "../providers/import.provider";
import { TagPill } from "./TagPill";

interface ImportExpenseRowProps {
  expense: ImportExpense;
  tags: Tag[];
  disabled: boolean;
}

export function ImportExpenseRow({
  expense,
  tags,
  disabled,
}: ImportExpenseRowProps) {
  const updateExpense = useImportStore((state) => state.updateExpense);

  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={expense.title}
          maxLength={100}
          disabled={disabled}
          onChange={(event) =>
            updateExpense(expense.id, (current) =>
              current.withTitle(event.target.value)
            )
          }
          className="flex-1"
        />
        <Input
          type="date"
          value={expense.expensedAt}
          disabled={disabled}
          onChange={(event) =>
            updateExpense(expense.id, (current) =>
              current.withDate(event.target.value)
            )
          }
          className="sm:w-44"
        />
        <span className="font-semibold text-gray-900 sm:w-32 sm:text-right">
          {expense.formattedTotal()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagPill
            key={tag.id}
            tag={tag}
            selected={expense.tagIds.includes(tag.id)}
            disabled={disabled}
            onClick={() =>
              updateExpense(expense.id, (current) => current.toggleTag(tag.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

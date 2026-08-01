import type {
  CreateExpensePayload,
  Expense,
} from "@/shared/types/expense.types";
import type { ExtractorResponse } from "../types/import.types";

export async function extractPdf(
  file: File,
  bank: string
): Promise<ExtractorResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bank", bank);

  const res = await fetch("/api/expenses/import-extract", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to extract PDF" }));
    throw new Error(error.error || error.message || "Failed to extract PDF");
  }

  const data: ExtractorResponse = await res.json();

  // The extractor returns 200 with an `error` field for unsupported banks.
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function bulkCreateExpenses(
  expenses: CreateExpensePayload[]
): Promise<Expense[]> {
  const res = await fetch("/api/expenses/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expenses }),
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to import expenses" }));
    throw new Error(
      error.message || error.error || "Failed to import expenses"
    );
  }

  return res.json();
}

import type {
  CreateExpensePayload,
  Expense,
  ExpensesQueryParams,
  ExpensesResponse,
  UpdateExpensePayload,
} from "@/shared/types/expense.types";

export async function fetchExpenses(
  params: ExpensesQueryParams = {}
): Promise<ExpensesResponse> {
  const queryParams = new URLSearchParams();

  if (params.startDate) queryParams.set("startDate", params.startDate);
  if (params.endDate) queryParams.set("endDate", params.endDate);
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.includeSummary !== undefined)
    queryParams.set("includeSummary", params.includeSummary.toString());
  if (params.tagIds?.length)
    queryParams.set("tagIds", params.tagIds.join(","));
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = `/api/expenses${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(error.error || "Failed to fetch expenses");
  }

  return res.json();
}

export async function createExpense(
  payload: CreateExpensePayload
): Promise<Expense> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to create" }));
    throw new Error(error.message || "Failed to create expense");
  }

  return res.json();
}

export async function updateExpense(
  id: string,
  payload: UpdateExpensePayload
): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to update" }));
    throw new Error(error.message || "Failed to update expense");
  }

  return res.json();
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to delete" }));
    throw new Error(error.message || "Failed to delete expense");
  }
}
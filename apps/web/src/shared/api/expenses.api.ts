import type {
  ExpensesQueryParams,
  ExpensesResponse,
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

  const queryString = queryParams.toString();
  const url = `/api/expenses${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(error.error || "Failed to fetch expenses");
  }

  return res.json();
}
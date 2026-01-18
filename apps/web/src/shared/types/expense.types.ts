export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  total: number;
  totalCents: number;
  expensedAt: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

export interface ExpensesSummary {
  rangeTotal: number;
}

export interface ExpensesResponse {
  data: Expense[];
  pagination: PaginationMeta;
  summary?: ExpensesSummary;
}

export interface ExpensesQueryParams {
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  limit?: number;
  page?: number;
  includeSummary?: boolean;
}

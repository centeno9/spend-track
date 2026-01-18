"use client";

import { formatCurrency } from "@/shared";
import { Wallet } from "lucide-react";
import { useExpenses } from "@/shared/hooks/useExpenses";
import { useExpenseFiltersStore } from "../providers/expense-filters.provider";
import { formatDateRangeDisplay } from "@/shared/lib/date.utils";

export const Totalizers = () => {
  // Get filter state from zustand
  const startDate = useExpenseFiltersStore((state) => state.startDate);
  const endDate = useExpenseFiltersStore((state) => state.endDate);
  const rangeMode = useExpenseFiltersStore((state) => state.rangeMode);
  const tagIds = useExpenseFiltersStore((state) => state.tagsId);

  // Calculate current year date range
  const currentYear = new Date().getFullYear();
  const yearStartDate = `${currentYear}-01-01`;
  const yearEndDate = `${currentYear}-12-31`;

  // Fetch range data
  const { data: rangeData, isLoading: rangeLoading } = useExpenses({
    startDate,
    endDate,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
    includeSummary: true,
  });

  // Fetch this year's data
  const { data: yearData, isLoading: yearLoading } = useExpenses({
    startDate: yearStartDate,
    endDate: yearEndDate,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
    includeSummary: true,
  });

  const rangeTotal = rangeData?.summary?.rangeTotal ?? 0;
  const rangeCount = rangeData?.data?.length ?? 0;
  const yearTotal = yearData?.summary?.rangeTotal ?? 0;
  const yearCount = yearData?.data?.length ?? 0;

  const rangeModeLabel =
    rangeMode === "day"
      ? "Today"
      : rangeMode === "custom"
      ? "Custom Range"
      : rangeMode.charAt(0).toUpperCase() + rangeMode.slice(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">
            Total Spent ({rangeModeLabel})
          </h3>
          <div className="p-2 bg-gray-50 rounded-lg">
            <Wallet className="text-gray-400 w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          {rangeLoading ? (
            <span className="text-gray-300">Loading...</span>
          ) : (
            formatCurrency(rangeTotal)
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {rangeLoading ? (
            "..."
          ) : (
            <>
              {formatDateRangeDisplay(startDate, endDate)}
              <span className="ml-2">({rangeCount} expenses)</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">
            This Year Expenses
          </h3>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <span className="text-xs font-bold text-gray-500">
              {yearLoading ? "..." : yearCount}
            </span>
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          {yearLoading ? (
            <span className="text-gray-300">Loading...</span>
          ) : (
            formatCurrency(yearTotal)
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Total spending in {currentYear}
        </div>
      </div>
    </div>
  );
};

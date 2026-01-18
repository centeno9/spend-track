"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useExpenses } from "@/shared/hooks/useExpenses";
import { useExpenseFiltersStore } from "../providers/expense-filters.provider";

interface ChartDataPoint {
  name: string; // Date label
  amount: number; // Dollars
  date: string; // ISO string for sorting/filtering
}

export const Chart = () => {
  // Get filter state from zustand
  const startDate = useExpenseFiltersStore((state) => state.startDate);
  const endDate = useExpenseFiltersStore((state) => state.endDate);

  // Fetch real expense data with filters
  const { data, isLoading, error } = useExpenses({
    startDate,
    endDate,
    includeSummary: true,
  });

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data?.data) return [];

    const dataMap = new Map<string, number>();

    // Initialize map with all days in range (to show 0s)
    const current = new Date(startDate);
    const end = new Date(endDate);
    // Safety check: prevent infinite loop if dates are weird
    let safetyCounter = 0;
    while (current <= end && safetyCounter < 365) {
      const key = current.toISOString().split("T")[0];
      dataMap.set(key, 0);
      current.setDate(current.getDate() + 1);
      safetyCounter += 1;
    }

    // Fill with actual expense data
    data.data.forEach((expense) => {
      const key = new Date(expense.expensedAt).toISOString().split("T")[0];
      if (dataMap.has(key)) {
        dataMap.set(key, (dataMap.get(key) || 0) + expense.total);
      }
    });

    return Array.from(dataMap.entries()).map(([date, amount]) => ({
      name: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount,
      date,
    }));
  }, [data, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px] mb-8">
        <div className="h-full flex items-center justify-center text-gray-400">
          Loading expenses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px] mb-8">
        <div className="h-full flex items-center justify-center text-red-400">
          Error loading expenses: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px] mb-8 relative">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Spending Trend
        {data?.summary && (
          <span className="text-sm text-gray-500 ml-2">
            (Total: ${data.summary.rangeTotal.toFixed(2)})
          </span>
        )}
      </h3>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              contentStyle={{
                backgroundColor: "#18181b",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#fff" }}
              formatter={(value?: number) => [
                typeof value === "number" ? `$${value.toFixed(2)}` : "$0.00",
                "Amount",
              ]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === chartData.length - 1 ? "#18181b" : "#e4e4e7"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400">
          No expenses for this period
        </div>
      )}
    </div>
  );
};

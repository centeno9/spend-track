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
} from "recharts";
import { useExpenses } from "@/shared/hooks/useExpenses";
import { useExpenseFiltersStore } from "../providers/expense-filters.provider";
import { parseLocalDate, formatToYYYYMMDD } from "@/shared/lib/date.utils";
import type { Tag } from "@/shared/types/expense.types";

// Special key for expenses without tags
const UNTAGGED_KEY = "__untagged__";
const UNTAGGED_COLOR = "#9ca3af"; // Gray
const DEFAULT_BAR_COLOR = "#e4e4e7";
const BORDER_RADIUS = 4;

// Props for custom bar shape
interface BarShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  payload: ChartDataPoint;
}

// Custom bar shape that only applies rounded corners to topmost segment
function RoundedBar({ x, y, width, height, fill, payload, tagId }: BarShapeProps & { tagId: string }) {
  if (height <= 0) return null;

  const isTop = payload.topTagId === tagId;
  const radius = isTop ? BORDER_RADIUS : 0;

  if (radius === 0) {
    // Simple rectangle for non-top segments
    return <rect x={x} y={y} width={width} height={height} fill={fill} />;
  }

  // Rounded rectangle for top segment
  return (
    <path
      d={`
        M ${x},${y + radius}
        Q ${x},${y} ${x + radius},${y}
        L ${x + width - radius},${y}
        Q ${x + width},${y} ${x + width},${y + radius}
        L ${x + width},${y + height}
        L ${x},${y + height}
        Z
      `}
      fill={fill}
    />
  );
}

interface TagInfo {
  id: string;
  name: string;
  color: string;
}

interface TagBreakdown {
  tag: TagInfo;
  total: number;
}

// Dynamic chart data with tag-based keys
type ChartDataPoint = {
  name: string;
  date: string;
  total: number;
  tagBreakdown: TagBreakdown[];
  topTagId: string | null; // The tag that's on top for this day
  [tagId: string]: number | string | TagBreakdown[] | null;
};

export const Chart = () => {
  // Get filter state from zustand
  const startDate = useExpenseFiltersStore((state) => state.startDate);
  const endDate = useExpenseFiltersStore((state) => state.endDate);
  const tagIds = useExpenseFiltersStore((state) => state.tagsId);

  // Fetch real expense data with filters
  const { data, isLoading, error } = useExpenses({
    startDate,
    endDate,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
    includeSummary: true,
  });

  // Process data for stacked bar chart
  const { chartData, uniqueTags } = useMemo(() => {
    if (!data?.data) return { chartData: [], uniqueTags: [] };

    // Collect all unique tags (using first tag of each expense)
    const tagsMap = new Map<string, TagInfo>();

    // Track if we have any untagged expenses
    let hasUntagged = false;

    // Map to store aggregated data per day
    const dataMap = new Map<
      string,
      { tagTotals: Map<string, number>; total: number; tagBreakdown: Map<string, { tag: TagInfo; total: number }> }
    >();

    // Initialize map with all days in range
    const current = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    let safetyCounter = 0;
    while (current <= end && safetyCounter < 365) {
      const key = formatToYYYYMMDD(current);
      dataMap.set(key, { tagTotals: new Map(), total: 0, tagBreakdown: new Map() });
      current.setDate(current.getDate() + 1);
      safetyCounter += 1;
    }

    // Process expenses - use first tag for color attribution
    data.data.forEach((expense) => {
      const dateKey = expense.expensedAt.split("T")[0];
      const dayData = dataMap.get(dateKey);
      if (!dayData) return;

      dayData.total += expense.total;

      // Use first tag for stacking, or mark as untagged
      const firstTag: Tag | undefined = expense.tags[0];

      if (firstTag) {
        // Add to tags map for legend/bars
        if (!tagsMap.has(firstTag.id)) {
          tagsMap.set(firstTag.id, {
            id: firstTag.id,
            name: firstTag.name,
            color: firstTag.color,
          });
        }

        // Accumulate total for this tag on this day
        const currentTotal = dayData.tagTotals.get(firstTag.id) || 0;
        dayData.tagTotals.set(firstTag.id, currentTotal + expense.total);

        // Update breakdown
        const existing = dayData.tagBreakdown.get(firstTag.id);
        if (existing) {
          existing.total += expense.total;
        } else {
          dayData.tagBreakdown.set(firstTag.id, {
            tag: { id: firstTag.id, name: firstTag.name, color: firstTag.color },
            total: expense.total,
          });
        }
      } else {
        // Untagged expense
        hasUntagged = true;
        const currentTotal = dayData.tagTotals.get(UNTAGGED_KEY) || 0;
        dayData.tagTotals.set(UNTAGGED_KEY, currentTotal + expense.total);

        const existing = dayData.tagBreakdown.get(UNTAGGED_KEY);
        if (existing) {
          existing.total += expense.total;
        } else {
          dayData.tagBreakdown.set(UNTAGGED_KEY, {
            tag: { id: UNTAGGED_KEY, name: "Untagged", color: UNTAGGED_COLOR },
            total: expense.total,
          });
        }
      }
    });

    // Build unique tags array for rendering bars
    const uniqueTags: TagInfo[] = Array.from(tagsMap.values());

    // Add untagged if we have any
    if (hasUntagged) {
      uniqueTags.push({ id: UNTAGGED_KEY, name: "Untagged", color: UNTAGGED_COLOR });
    }

    // Build chart data with dynamic tag keys
    const chartData: ChartDataPoint[] = Array.from(dataMap.entries()).map(
      ([date, dayData]) => {
        // Find the topmost tag (last one in uniqueTags order that has a value)
        let topTagId: string | null = null;
        for (let i = uniqueTags.length - 1; i >= 0; i--) {
          const tagTotal = dayData.tagTotals.get(uniqueTags[i].id) || 0;
          if (tagTotal > 0) {
            topTagId = uniqueTags[i].id;
            break;
          }
        }

        const point: ChartDataPoint = {
          name: parseLocalDate(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          date,
          total: dayData.total,
          tagBreakdown: Array.from(dayData.tagBreakdown.values()).sort(
            (a, b) => b.total - a.total
          ),
          topTagId,
        };

        // Add each tag's total as a property
        uniqueTags.forEach((tag) => {
          point[tag.id] = dayData.tagTotals.get(tag.id) || 0;
        });

        return point;
      }
    );

    return { chartData, uniqueTags };
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

  // Check if we have any data with tags
  const hasTags = uniqueTags.length > 0;

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
              content={<CustomTooltip />}
            />

            {hasTags ? (
              // Render stacked bars for each tag
              uniqueTags.map((tag) => (
                <Bar
                  key={tag.id}
                  dataKey={tag.id}
                  stackId="expenses"
                  fill={tag.color}
                  maxBarSize={50}
                  shape={(props: unknown) => (
                    <RoundedBar {...(props as BarShapeProps)} tagId={tag.id} />
                  )}
                />
              ))
            ) : (
              // Fallback: single bar if no tags
              <Bar
                dataKey="total"
                fill={DEFAULT_BAR_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            )}
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

// Custom tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const hasExpenses = data.total > 0;

  return (
    <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm min-w-[140px]">
      <div className="font-medium mb-1">{data.name}</div>
      <div className="text-lg font-bold">${data.total.toFixed(2)}</div>

      {hasExpenses && data.tagBreakdown.length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-700 space-y-1">
          {data.tagBreakdown.slice(0, 5).map(({ tag, total }) => (
            <div key={tag.id} className="flex items-center gap-2 text-xs">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-zinc-300 truncate flex-1">{tag.name}</span>
              <span className="text-zinc-400">${total.toFixed(2)}</span>
            </div>
          ))}
          {data.tagBreakdown.length > 5 && (
            <div className="text-xs text-zinc-500">
              +{data.tagBreakdown.length - 5} more tags
            </div>
          )}
        </div>
      )}

      {hasExpenses && data.tagBreakdown.length === 0 && (
        <div className="mt-1 text-xs text-zinc-400">No tags</div>
      )}
    </div>
  );
}

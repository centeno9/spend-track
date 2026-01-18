"use client";
import { CalendarIcon, Download } from "lucide-react";
import { Button, cn } from "@/shared";
import { useExpenseFiltersStore } from "../providers/expense-filters.provider";

type RangeMode = "day" | "week" | "month" | "custom";

export const ControlBar = () => {
  const rangeMode = useExpenseFiltersStore((state) => state.rangeMode);
  const startDate = useExpenseFiltersStore((state) => state.startDate);
  const endDate = useExpenseFiltersStore((state) => state.endDate);
  const setRangeMode = useExpenseFiltersStore((state) => state.setRangeMode);
  const setCustomDates = useExpenseFiltersStore(
    (state) => state.setCustomDates
  );

  const handleRangeModeChange = (mode: RangeMode) => {
    setRangeMode(mode);
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setCustomDates(value, endDate);
    } else {
      setCustomDates(startDate, value);
    }
  };

  return (
    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
      {/* Date Range Selectors */}
      <div className="flex items-center p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
        {(["day", "week", "month"] as RangeMode[]).map((mode) => (
          <Button
            key={mode}
            onClick={() => handleRangeModeChange(mode)}
            className={`bg-white px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${
              rangeMode === mode
                ? "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-100"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {mode === "day" ? "Today" : mode}
          </Button>
        ))}

        <div className="w-px h-4 bg-gray-200 mx-2 hidden md:block"></div>

        <Button
          onClick={() => handleRangeModeChange("custom")}
          className={cn(
            `bg-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 hover:bg-gray-50`,
            rangeMode === "custom"
              ? "bg-gray-100 text-gray-900 hover:bg-gray-100 shadow-sm "
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <CalendarIcon size={14} />
          Custom
        </Button>
      </div>

      {rangeMode === "custom" && (
        <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-right duration-200">
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleCustomDateChange("start", e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleCustomDateChange("end", e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-2 w-full md:w-auto justify-end border-t md:border-t-0 border-gray-100 pt-2 md:pt-0 mt-1 md:mt-0">
        <div className="w-px h-4 bg-gray-200 mx-1"></div>
        <Button
          onClick={() => {}}
          className="bg-white flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>
    </div>
  );
};

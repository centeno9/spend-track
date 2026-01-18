import { createStore } from "zustand";
import { getDateRangeForMode } from "@/shared/lib/date.utils";

type RangeMode = "day" | "week" | "month" | "custom";

export type ExpenseFilterStates = {
  rangeMode: RangeMode;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  tagsId: string[];
  page: number;
  limit: number;
};

export type ExpenseFiltersStore = ExpenseFilterStates & {
  setRangeMode: (rangeMode: RangeMode) => void;
  setCustomDates: (startDate: string, endDate: string) => void;
  setTags: (tagIds: string[]) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
};

// Initialize with current week dates
const initialDates = getDateRangeForMode("week");

export const expenseFiltersInitState: ExpenseFilterStates = {
  rangeMode: "week",
  startDate: initialDates.startDate,
  endDate: initialDates.endDate,
  tagsId: [],
  page: 1,
  limit: 1000,
};

export const createExpenseFiltersStore = (
  initState: ExpenseFilterStates = expenseFiltersInitState
) => {
  return createStore<ExpenseFiltersStore>()((set, get) => ({
    ...initState,

    // When range mode changes, automatically calculate dates
    setRangeMode: (rangeMode: RangeMode) => {
      const currentState = get();

      // For custom mode, keep existing dates
      if (rangeMode === "custom") {
        set(() => ({ rangeMode }));
        return;
      }

      // Calculate new dates based on range mode
      const { startDate, endDate } = getDateRangeForMode(rangeMode);
      set(() => ({
        rangeMode,
        startDate,
        endDate,
      }));
    },

    // For custom date changes
    setCustomDates: (startDate: string, endDate: string) =>
      set(() => ({
        rangeMode: "custom",
        startDate,
        endDate,
      })),

    setTags: (tagIds: string[]) => set(() => ({ tagsId: tagIds })),
    setPage: (page: number) => set(() => ({ page })),
    setLimit: (limit: number) => set(() => ({ limit })),
  }));
};

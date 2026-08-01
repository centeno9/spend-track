import { createStore } from "zustand";
import { ImportExpense } from "../domain/import-expense";

export type ImportStatus =
  | "idle"
  | "extracting"
  | "ready"
  | "submitting"
  | "done"
  | "error";

export type ImportStates = {
  bank: string;
  file: File | null;
  status: ImportStatus;
  errorMessage: string | null;
  expenses: ImportExpense[];
};

export type ImportStore = ImportStates & {
  setBank: (bank: string) => void;
  setFile: (file: File | null) => void;
  setStatus: (status: ImportStatus) => void;
  setError: (message: string | null) => void;
  setExpenses: (expenses: ImportExpense[]) => void;
  updateExpense: (
    id: string,
    updater: (expense: ImportExpense) => ImportExpense
  ) => void;
  applyTagsToAll: (tagIds: string[]) => void;
  reset: () => void;
};

export const importInitState: ImportStates = {
  bank: "bbva",
  file: null,
  status: "idle",
  errorMessage: null,
  expenses: [],
};

export const createImportStore = (
  initState: ImportStates = importInitState
) => {
  return createStore<ImportStore>()((set) => ({
    ...initState,

    setBank: (bank) => set(() => ({ bank })),
    setFile: (file) => set(() => ({ file })),
    setStatus: (status) => set(() => ({ status })),
    setError: (errorMessage) => set(() => ({ errorMessage })),
    setExpenses: (expenses) => set(() => ({ expenses })),

    updateExpense: (id, updater) =>
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id ? updater(expense) : expense
        ),
      })),

    applyTagsToAll: (tagIds) =>
      set((state) => ({
        expenses: state.expenses.map((expense) => expense.withTags(tagIds)),
      })),

    reset: () => set(() => ({ ...importInitState })),
  }));
};

"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import {
  createExpenseFiltersStore,
  type ExpenseFiltersStore,
} from "../stores/expense-filters.store";
import { useStore } from "zustand";

export type ExpenseFiltersStoreApi = ReturnType<
  typeof createExpenseFiltersStore
>;

export const ExpenseFiltersStoreContext = createContext<
  ExpenseFiltersStoreApi | undefined
>(undefined);

export interface ExpenseFiltersStoreProviderProps {
  children: ReactNode;
}

export const ExpenseFiltersStoreProvider = ({
  children,
}: ExpenseFiltersStoreProviderProps) => {
  const [store] = useState(() => createExpenseFiltersStore());

  return (
    <ExpenseFiltersStoreContext.Provider value={store}>
      {children}
    </ExpenseFiltersStoreContext.Provider>
  );
};

export const useExpenseFiltersStore = <T,>(
  selector: (store: ExpenseFiltersStore) => T
): T => {
  const expenseFiltersStoreContext = useContext(ExpenseFiltersStoreContext);

  if (!expenseFiltersStoreContext) {
    throw new Error(
      `useExpenseFiltersStore must be used within ExpenseFiltersStoreProvider`
    );
  }

  return useStore(expenseFiltersStoreContext, selector);
};

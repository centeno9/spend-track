"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { useStore } from "zustand";
import {
  createImportStore,
  type ImportStore,
} from "../stores/import.store";

export type ImportStoreApi = ReturnType<typeof createImportStore>;

export const ImportStoreContext = createContext<ImportStoreApi | undefined>(
  undefined
);

export interface ImportStoreProviderProps {
  children: ReactNode;
}

export const ImportStoreProvider = ({ children }: ImportStoreProviderProps) => {
  const [store] = useState(() => createImportStore());

  return (
    <ImportStoreContext.Provider value={store}>
      {children}
    </ImportStoreContext.Provider>
  );
};

export const useImportStore = <T,>(
  selector: (store: ImportStore) => T
): T => {
  const importStoreContext = useContext(ImportStoreContext);

  if (!importStoreContext) {
    throw new Error(`useImportStore must be used within ImportStoreProvider`);
  }

  return useStore(importStoreContext, selector);
};

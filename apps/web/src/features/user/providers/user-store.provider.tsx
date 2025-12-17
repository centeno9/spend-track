"use client";
import { createUserStore, User, UserStore } from "@/features/user";
import { createContext, ReactNode, useContext, useState } from "react";
import { useStore } from "zustand";

export type UserStoreApi = ReturnType<typeof createUserStore>;

export const UserStoreContext = createContext<UserStoreApi | undefined>(
  undefined
);

export interface UserStoreProviderProps {
  children: ReactNode;
  user: User;
}
export const UserStoreProvider = ({
  children,
  user,
}: UserStoreProviderProps) => {
  const [store] = useState(() => createUserStore({ currentUser: user }));

  return (
    <UserStoreContext.Provider value={store}>
      {children}
    </UserStoreContext.Provider>
  );
};

export const useUserStore = <T,>(selector: (store: UserStore) => T): T => {
  const userStoreContext = useContext(UserStoreContext);
  if (!userStoreContext) {
    throw new Error(`useUserStore must be used within UserStoreProvider`);
  }
  return useStore(userStoreContext, selector);
};

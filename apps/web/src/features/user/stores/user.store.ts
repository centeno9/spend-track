import { User } from "@/features/user";
import { createStore } from "zustand/vanilla";

export type UserState = {
  currentUser: User;
};

export type UserStore = UserState;

export const createUserStore = (initialState: UserState) => {
  return createStore<UserStore>()((set) => ({
    ...initialState,
  }));
};

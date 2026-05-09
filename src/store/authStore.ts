import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number | string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: "travelora-auth",
    }
  )
);

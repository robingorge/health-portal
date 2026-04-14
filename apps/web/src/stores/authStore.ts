import { create } from "zustand";
import type { PatientDto } from "@health-portal/shared";

type AuthState = {
  user: PatientDto | null;
  isAuthenticated: boolean;
  setUser: (user: PatientDto) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));

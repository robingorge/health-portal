import { create } from "zustand";
import type { PatientDto } from "@health-portal/shared";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

// "probing" — /auth/me in flight (initial load or explicit re-check)
// "authenticated" — live session, `user` populated
// "unauthenticated" — definitively logged out; layout should redirect to /
// "error" — non-auth failure (network, 5xx); `error` holds the message
export type AuthStatus = "idle" | "probing" | "authenticated" | "unauthenticated" | "error";

type AuthState = {
  user: PatientDto | null;
  status: AuthStatus;
  error: string | null;

  probe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearUser: () => void;
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  error: null,

  async probe() {
    // De-dup concurrent probes (React StrictMode double-invoke, fast route
    // transitions) — all callers await the same in-flight request implicitly.
    if (get().status === "probing") return;
    set({ status: "probing", error: null });
    try {
      const user = await authApi.me();
      set({ user, status: "authenticated" });
    } catch (err) {
      if (err instanceof ApiError && err.code === "NOT_AUTHENTICATED") {
        set({ user: null, status: "unauthenticated", error: null });
      } else {
        set({ status: "error", error: errorMessage(err, "Failed to load your session.") });
      }
    }
  },

  async login(email, password) {
    set({ status: "probing", error: null });
    try {
      const user = await authApi.login(email, password);
      set({ user, status: "authenticated" });
    } catch (err) {
      set({ user: null, status: "unauthenticated", error: errorMessage(err, "Login failed.") });
      throw err;
    }
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: "unauthenticated", error: null });
    }
  },

  clearUser() {
    set({ user: null, status: "unauthenticated", error: null });
  },
}));

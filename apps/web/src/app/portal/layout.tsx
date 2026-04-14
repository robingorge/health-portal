"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { setOnUnauthorized } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/prescriptions", label: "Prescriptions" },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, error, probe, logout, clearUser } = useAuthStore();

  // Kick off the session probe on mount and register a global 401 handler.
  // Any async auth logic lives in the store; the layout only reacts to state.
  useEffect(() => {
    setOnUnauthorized(() => useAuthStore.getState().clearUser());
    probe();
    return () => setOnUnauthorized(null);
  }, [probe]);

  // React to the store's verdict: once the probe (or any later 401) flips
  // status to "unauthenticated", bounce to the login page.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#edfeee] px-4">
        <div className="max-w-sm rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? "Failed to load your session."}
        </div>
        <button
          onClick={() => {
            clearUser();
            probe();
          }}
          className="rounded-md border border-[#101f15]/15 bg-white px-3 py-1.5 text-sm font-medium text-[#101f15] hover:bg-[#101f15]/5"
        >
          Retry
        </button>
      </main>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edfeee]">
        <p className="text-sm text-[#101f15]/60">Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#edfeee]">
      <header className="border-b border-[#101f15]/10 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/portal"
            className="text-base font-semibold text-[#101f15] sm:text-lg"
          >
            HealthPortal
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "font-semibold text-[#101f15]"
                      : "text-[#101f15]/60 hover:text-[#101f15]"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="mx-2 hidden h-5 w-px bg-[#101f15]/10 sm:block" />
            <span className="hidden text-[#101f15]/60 sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-[#101f15]/15 bg-white px-3 py-1 text-xs font-medium text-[#101f15] hover:bg-[#101f15]/5"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

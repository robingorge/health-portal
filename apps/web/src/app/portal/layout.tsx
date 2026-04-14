"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/lib/api/auth";
import { ApiError, setOnUnauthorized } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/prescriptions", label: "Prescriptions" },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();

  // Optimistic render: if the store already has a user we unblock the UI
  // immediately, but we ALWAYS revalidate with `me()` below. The Zustand
  // flag lives in memory and can outlive the server-side session (expired
  // cookie, logged-out-in-another-tab, server restart) — trusting it
  // without a probe would leave the portal accessible while every data
  // call 401s.
  const [ready, setReady] = useState(isAuthenticated);
  const [probeError, setProbeError] = useState<string | null>(null);

  // Central handler: any request that 401s (NOT_AUTHENTICATED) anywhere in
  // the portal tears down auth state and kicks back to /. Fires once per
  // expired session regardless of which page triggered the call.
  useEffect(() => {
    setOnUnauthorized(() => {
      clearUser();
      router.replace("/");
    });
    return () => setOnUnauthorized(null);
  }, [clearUser, router]);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((patient) => {
        if (cancelled) return;
        setUser(patient);
        setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        // Only real auth failures should bounce to login. Network errors,
        // timeouts, and 5xxs should surface as a retryable error so a brief
        // outage doesn't force an unnecessary re-login.
        if (err instanceof ApiError && err.code === "NOT_AUTHENTICATED") {
          clearUser();
          router.replace("/");
          return;
        }
        setProbeError(err instanceof Error ? err.message : "Failed to load your session.");
      });
    return () => {
      cancelled = true;
    };
  }, [router, setUser, clearUser]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      clearUser();
      router.replace("/");
    }
  }

  if (probeError && !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#edfeee] px-4">
        <div className="max-w-sm rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {probeError}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md border border-[#101f15]/15 bg-white px-3 py-1.5 text-sm font-medium text-[#101f15] hover:bg-[#101f15]/5"
        >
          Retry
        </button>
      </main>
    );
  }

  if (!ready || !user) {
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
          <Link href="/portal" className="text-base font-semibold text-[#101f15] sm:text-lg">
            VitalityCare
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
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

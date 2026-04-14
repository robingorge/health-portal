"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/lib/api/auth";
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

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((patient) => {
        if (cancelled) return;
        setUser(patient);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearUser();
        router.replace("/");
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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/portal" className="text-lg font-semibold text-[#101f15]">
            VitalityCare
          </Link>
          <nav className="flex items-center gap-4 text-sm">
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
            <span className="mx-2 h-5 w-px bg-[#101f15]/10" />
            <span className="text-[#101f15]/60">
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
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

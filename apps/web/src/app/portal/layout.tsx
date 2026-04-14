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

  // `ready` blocks render until we've either confirmed a session (via the
  // store or a `me()` probe) or redirected to the login page. Prevents a
  // flash of portal chrome for unauthenticated visitors who land directly.
  const [ready, setReady] = useState(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setReady(true);
      return;
    }
    let cancelled = false;
    authApi
      .me()
      .then((patient) => {
        if (cancelled) return;
        setUser(patient);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/");
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, router, setUser]);

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

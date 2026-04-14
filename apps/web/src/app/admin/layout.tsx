import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#edfeee]">
      <header className="border-b border-[#101f15]/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="text-base font-semibold text-[#101f15] sm:text-lg">
            VitalityCare · Admin
          </Link>
          <span className="text-xs text-[#101f15]/50">Mini EMR</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

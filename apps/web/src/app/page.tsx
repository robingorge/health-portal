"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { status, probe, login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-use the store's probe so a user with a live session skips the form.
  useEffect(() => {
    probe();
  }, [probe]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/portal");
  }, [status, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/portal");
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_CREDENTIALS") {
        setError("Incorrect email or password.");
      } else if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        setError("Please enter a valid email and password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  // Show the loading shell until the store reaches a definitive
  // "unauthenticated" state. Covers the initial probe AND the window between
  // a successful login (status flips to "authenticated") and the router
  // finishing the redirect to /portal — without this, the form flashes.
  if (status !== "unauthenticated" && status !== "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edfeee]">
        <p className="text-sm text-[#101f15]/60">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edfeee] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#101f15]">
          HealthPortal
        </h1>
        <p className="mb-6 text-sm text-[#101f15]/60">
          Sign in to your patient portal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#101f15]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#101f15]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#101f15]/40"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#101f15]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#101f15]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#101f15]/40"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[#101f15] py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

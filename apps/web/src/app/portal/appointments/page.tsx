"use client";

import { useEffect, useState } from "react";
import type { AppointmentOccurrence } from "@health-portal/shared";
import { portalApi } from "@/lib/api/portal";

export default function PortalAppointmentsPage() {
  const [items, setItems] = useState<AppointmentOccurrence[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portalApi
      .appointments()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load appointments."),
      );
  }, []);

  return (
    <section>
      <h1 className="mb-1 text-2xl font-bold text-[#101f15]">Appointments</h1>
      <p className="mb-6 text-sm text-[#101f15]/60">Your schedule for the next 3 months.</p>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && items === null && <p className="text-sm text-[#101f15]/60">Loading…</p>}

      {items && items.length === 0 && (
        <p className="rounded-md border border-dashed border-[#101f15]/15 p-6 text-center text-sm text-[#101f15]/60">
          No upcoming appointments.
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((a) => (
            <li
              key={`${a.appointmentId}-${a.date}`}
              className="rounded-md border border-[#101f15]/10 bg-white p-4"
            >
              <p className="text-sm font-medium text-[#101f15]">{a.description}</p>
              <p className="text-xs text-[#101f15]/60">
                {new Date(a.date).toLocaleString()} · {a.durationMinutes} min · {a.providerName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

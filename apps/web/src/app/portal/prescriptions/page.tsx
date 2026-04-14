"use client";

import { useEffect, useState } from "react";
import type { PrescriptionDto } from "@health-portal/shared";
import { portalApi } from "@/lib/api/portal";

export default function PortalPrescriptionsPage() {
  const [items, setItems] = useState<PrescriptionDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portalApi
      .prescriptions()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load prescriptions."),
      );
  }, []);

  return (
    <section>
      <h1 className="mb-1 text-2xl font-bold text-[#101f15]">Prescriptions</h1>
      <p className="mb-6 text-sm text-[#101f15]/60">All medications on file.</p>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && items === null && <p className="text-sm text-[#101f15]/60">Loading…</p>}

      {items && items.length === 0 && (
        <p className="rounded-md border border-dashed border-[#101f15]/15 p-6 text-center text-sm text-[#101f15]/60">
          No prescriptions on file.
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id} className="rounded-md border border-[#101f15]/10 bg-white p-4">
              <p className="text-sm font-medium text-[#101f15]">
                {r.medicationName} · {r.dosage}
              </p>
              <p className="text-xs text-[#101f15]/60">
                Qty {r.quantity} · First refill {r.firstRefillDate}
              </p>
              {r.refillSchedule && (
                <p className="text-xs text-[#101f15]/50">
                  Every {r.refillSchedule.frequencyDays} days until {r.refillSchedule.endDate}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

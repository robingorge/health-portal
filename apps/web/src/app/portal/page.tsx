"use client";

import { useEffect, useState } from "react";
import type { PatientSummaryDto } from "@health-portal/shared";
import { portalApi } from "@/lib/api/portal";

export default function PortalDashboard() {
  const [summary, setSummary] = useState<PatientSummaryDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portalApi
      .summary()
      .then(setSummary)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load summary."),
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (!summary) {
    return <p className="text-sm text-[#101f15]/60">Loading…</p>;
  }

  const { patient, upcomingAppointments, upcomingRefills } = summary;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[#101f15]/10 bg-white p-6">
        <h1 className="text-2xl font-bold text-[#101f15]">
          Welcome, {patient.firstName}
        </h1>
        <p className="mt-1 text-sm text-[#101f15]/60">
          Here's what's coming up in the next 7 days.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div><dt className="text-[#101f15]/50">Email</dt><dd>{patient.email}</dd></div>
          <div><dt className="text-[#101f15]/50">Phone</dt><dd>{patient.phone}</dd></div>
          <div><dt className="text-[#101f15]/50">DOB</dt><dd>{patient.dateOfBirth}</dd></div>
          <div><dt className="text-[#101f15]/50">Blood</dt><dd>{patient.bloodType}</dd></div>
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#101f15]">
          Upcoming appointments
        </h2>
        {upcomingAppointments.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#101f15]/15 p-6 text-center text-sm text-[#101f15]/60">
            No appointments in the next 7 days.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingAppointments.map((a) => (
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

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#101f15]">
          Upcoming refills
        </h2>
        {upcomingRefills.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#101f15]/15 p-6 text-center text-sm text-[#101f15]/60">
            No refills in the next 7 days.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingRefills.map((r) => (
              <li
                key={`${r.prescriptionId}-${r.date}`}
                className="rounded-md border border-[#101f15]/10 bg-white p-4"
              >
                <p className="text-sm font-medium text-[#101f15]">
                  {r.medicationName} · {r.dosage}
                </p>
                <p className="text-xs text-[#101f15]/60">Refill on {r.date}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

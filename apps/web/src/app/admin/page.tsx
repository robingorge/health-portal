"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PatientDto, CreatePatientDto } from "@health-portal/shared";
import { patientApi } from "@/lib/api/patient";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/admin/Modal";
import { PatientForm } from "@/components/admin/PatientForm";
import { primaryBtnClass } from "@/components/admin/forms";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<PatientDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPatients(await patientApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data: CreatePatientDto) {
    try {
      await patientApi.create(data);
    } catch (err) {
      if (err instanceof ApiError && err.code === "DUPLICATE_EMAIL") {
        throw new Error("A patient with that email already exists.");
      }
      throw err;
    }
    setCreating(false);
    await load();
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#101f15]">Patients</h1>
        <button className={primaryBtnClass} onClick={() => setCreating(true)}>
          New patient
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {patients === null && !error && (
        <p className="text-sm text-[#101f15]/60">Loading…</p>
      )}

      {patients && patients.length === 0 && (
        <p className="rounded-md border border-dashed border-[#101f15]/15 p-6 text-center text-sm text-[#101f15]/60">
          No patients yet. Create one to get started.
        </p>
      )}

      {patients && patients.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#101f15]/10 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#101f15]/5 text-left text-xs uppercase tracking-wide text-[#101f15]/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Blood</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-t border-[#101f15]/5">
                  <td className="px-4 py-3 font-medium text-[#101f15]">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-3 text-[#101f15]/80">{p.email}</td>
                  <td className="px-4 py-3 text-[#101f15]/80">{p.phone}</td>
                  <td className="px-4 py-3 text-[#101f15]/80">{p.dateOfBirth}</td>
                  <td className="px-4 py-3 text-[#101f15]/80">{p.bloodType}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/patients/${p.id}`}
                      className="text-sm font-medium text-[#101f15] hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={creating} title="New patient" onClose={() => setCreating(false)}>
        <PatientForm mode="create" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>
    </section>
  );
}

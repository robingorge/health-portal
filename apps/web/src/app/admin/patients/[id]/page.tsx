"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type {
  AppointmentDto,
  CreateAppointmentDto,
  CreatePrescriptionDto,
  PatientDto,
  PrescriptionDto,
  UpdateAppointmentDto,
  UpdatePatientDto,
  UpdatePrescriptionDto,
} from "@health-portal/shared";
import { patientApi } from "@/lib/api/patient";
import { appointmentApi } from "@/lib/api/appointment";
import { prescriptionApi } from "@/lib/api/prescription";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/admin/Modal";
import { PatientForm } from "@/components/admin/PatientForm";
import { AppointmentForm } from "@/components/admin/AppointmentForm";
import { PrescriptionForm } from "@/components/admin/PrescriptionForm";
import {
  dangerBtnClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/admin/forms";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<PatientDto | null>(null);
  const [appointments, setAppointments] = useState<AppointmentDto[] | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingPatient, setEditingPatient] = useState(false);
  const [creatingAppt, setCreatingAppt] = useState(false);
  const [editingAppt, setEditingAppt] = useState<AppointmentDto | null>(null);
  const [creatingRx, setCreatingRx] = useState(false);
  const [editingRx, setEditingRx] = useState<PrescriptionDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, a, r] = await Promise.all([
        patientApi.getById(id),
        patientApi.appointments(id),
        patientApi.prescriptions(id),
      ]);
      setPatient(p);
      setAppointments(a);
      setPrescriptions(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function savePatient(data: UpdatePatientDto) {
    try {
      await patientApi.update(id, data);
    } catch (err) {
      if (err instanceof ApiError && err.code === "DUPLICATE_EMAIL") {
        throw new Error("A patient with that email already exists.");
      }
      throw err;
    }
    setEditingPatient(false);
    await load();
  }

  async function createAppt(data: CreateAppointmentDto) {
    await appointmentApi.create(data);
    setCreatingAppt(false);
    await load();
  }

  async function saveAppt(data: UpdateAppointmentDto) {
    if (!editingAppt) return;
    await appointmentApi.update(editingAppt.id, data);
    setEditingAppt(null);
    await load();
  }

  async function removeAppt(appt: AppointmentDto) {
    if (!confirm(`Delete appointment "${appt.description}"?`)) return;
    setActionError(null);
    try {
      await appointmentApi.remove(appt.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete appointment.");
    }
  }

  async function createRx(data: CreatePrescriptionDto) {
    await prescriptionApi.create(data);
    setCreatingRx(false);
    await load();
  }

  async function saveRx(data: UpdatePrescriptionDto) {
    if (!editingRx) return;
    await prescriptionApi.update(editingRx.id, data);
    setEditingRx(null);
    await load();
  }

  async function removeRx(rx: PrescriptionDto) {
    if (!confirm(`Delete prescription "${rx.medicationName}"?`)) return;
    setActionError(null);
    try {
      await prescriptionApi.remove(rx.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete prescription.");
    }
  }

  if (error) {
    return (
      <div className="space-y-3">
        <Link href="/admin" className="text-sm text-[#101f15]/60 hover:underline">← Back</Link>
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!patient || appointments === null || prescriptions === null) {
    return <p className="text-sm text-[#101f15]/60">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-[#101f15]/60 hover:underline">← Back</Link>
      </div>

      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <section className="rounded-xl border border-[#101f15]/10 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#101f15]">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-[#101f15]/60">{patient.email}</p>
          </div>
          <button className={secondaryBtnClass} onClick={() => setEditingPatient(true)}>
            Edit patient
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div><dt className="text-[#101f15]/50">Phone</dt><dd>{patient.phone}</dd></div>
          <div><dt className="text-[#101f15]/50">DOB</dt><dd>{patient.dateOfBirth}</dd></div>
          <div><dt className="text-[#101f15]/50">Blood</dt><dd>{patient.bloodType}</dd></div>
          <div><dt className="text-[#101f15]/50">Created</dt><dd>{patient.createdAt.slice(0, 10)}</dd></div>
        </dl>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#101f15]">Appointments</h2>
          <button className={primaryBtnClass} onClick={() => setCreatingAppt(true)}>New appointment</button>
        </div>
        {appointments.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#101f15]/15 p-6 text-center text-sm text-[#101f15]/60">
            No appointments yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {appointments.map((a) => (
              <li key={a.id} className="flex flex-col items-start justify-between gap-3 rounded-md border border-[#101f15]/10 bg-white p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-[#101f15]">{a.description}</p>
                  <p className="text-xs text-[#101f15]/60">
                    {new Date(a.firstAppointment).toLocaleString()} · {a.durationMinutes} min · {a.providerName}
                  </p>
                  {a.recurrence && (
                    <p className="text-xs text-[#101f15]/50">
                      Recurs {a.recurrence.frequency} until {a.recurrence.endDate}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className={secondaryBtnClass} onClick={() => setEditingAppt(a)}>Edit</button>
                  <button className={dangerBtnClass} onClick={() => removeAppt(a)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#101f15]">Prescriptions</h2>
          <button className={primaryBtnClass} onClick={() => setCreatingRx(true)}>New prescription</button>
        </div>
        {prescriptions.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#101f15]/15 p-6 text-center text-sm text-[#101f15]/60">
            No prescriptions yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {prescriptions.map((r) => (
              <li key={r.id} className="flex items-start justify-between rounded-md border border-[#101f15]/10 bg-white p-4">
                <div>
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
                </div>
                <div className="flex gap-2">
                  <button className={secondaryBtnClass} onClick={() => setEditingRx(r)}>Edit</button>
                  <button className={dangerBtnClass} onClick={() => removeRx(r)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={editingPatient} title="Edit patient" onClose={() => setEditingPatient(false)}>
        <PatientForm mode="edit" initial={patient} onSubmit={savePatient} onCancel={() => setEditingPatient(false)} />
      </Modal>

      <Modal open={creatingAppt} title="New appointment" onClose={() => setCreatingAppt(false)}>
        <AppointmentForm mode="create" patientId={id} onSubmit={createAppt} onCancel={() => setCreatingAppt(false)} />
      </Modal>

      <Modal open={editingAppt !== null} title="Edit appointment" onClose={() => setEditingAppt(null)}>
        {editingAppt && (
          <AppointmentForm mode="edit" initial={editingAppt} onSubmit={saveAppt} onCancel={() => setEditingAppt(null)} />
        )}
      </Modal>

      <Modal open={creatingRx} title="New prescription" onClose={() => setCreatingRx(false)}>
        <PrescriptionForm mode="create" patientId={id} onSubmit={createRx} onCancel={() => setCreatingRx(false)} />
      </Modal>

      <Modal open={editingRx !== null} title="Edit prescription" onClose={() => setEditingRx(null)}>
        {editingRx && (
          <PrescriptionForm mode="edit" initial={editingRx} onSubmit={saveRx} onCancel={() => setEditingRx(null)} />
        )}
      </Modal>
    </div>
  );
}

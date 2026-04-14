"use client";

import { useEffect, useState, type FormEvent } from "react";
import type {
  CreatePrescriptionDto,
  PrescriptionDto,
  UpdatePrescriptionDto,
} from "@health-portal/shared";
import { prescriptionApi, type PrescriptionOptions } from "@/lib/api/prescription";
import { inputClass, labelClass, primaryBtnClass, secondaryBtnClass } from "./forms";

type Props =
  | {
      mode: "create";
      patientId: string;
      onSubmit: (data: CreatePrescriptionDto) => Promise<void>;
      onCancel: () => void;
      initial?: undefined;
    }
  | {
      mode: "edit";
      initial: PrescriptionDto;
      onSubmit: (data: UpdatePrescriptionDto) => Promise<void>;
      onCancel: () => void;
    };

export function PrescriptionForm(props: Props) {
  const { mode, onSubmit, onCancel } = props;
  const initial = mode === "edit" ? props.initial : undefined;

  const [options, setOptions] = useState<PrescriptionOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [medicationName, setMedicationName] = useState(initial?.medicationName ?? "");
  const [dosage, setDosage] = useState(initial?.dosage ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity ?? 30);
  const [firstRefillDate, setFirstRefillDate] = useState(initial?.firstRefillDate ?? "");
  const [hasSchedule, setHasSchedule] = useState(initial?.refillSchedule != null);
  const [frequencyDays, setFrequencyDays] = useState(initial?.refillSchedule?.frequencyDays ?? 30);
  const [endDate, setEndDate] = useState(initial?.refillSchedule?.endDate ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    prescriptionApi
      .options()
      .then((o) => {
        setOptions(o);
        // Default dropdowns to the first option when creating.
        if (!initial) {
          setMedicationName((prev) => prev || o.medications[0] || "");
          setDosage((prev) => prev || o.dosages[0] || "");
        }
      })
      .catch((err) => {
        setOptionsError(
          err instanceof Error
            ? err.message
            : "Couldn't load medication options. Please close this form and try again.",
        );
      });
  }, [initial]);

  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await onSubmit({
          patientId: props.patientId,
          medicationName,
          dosage,
          quantity,
          firstRefillDate,
          refillSchedule: hasSchedule ? { frequencyDays, endDate } : undefined,
        });
      } else {
        await onSubmit({
          medicationName,
          dosage,
          quantity,
          firstRefillDate,
          refillSchedule: hasSchedule ? { frequencyDays, endDate } : null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prescription.");
      setSubmitting(false);
    }
  }

  if (optionsError) {
    return (
      <div className="space-y-4">
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {optionsError}
        </div>
        <div className="flex justify-end">
          <button type="button" className={secondaryBtnClass} onClick={onCancel}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!options) {
    return <p className="text-sm text-[#101f15]/60">Loading options…</p>;
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Medication</label>
          <select className={inputClass} value={medicationName} onChange={(e) => setMedicationName(e.target.value)} required>
            {options.medications.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Dosage</label>
          <select className={inputClass} value={dosage} onChange={(e) => setDosage(e.target.value)} required>
            {options.dosages.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Quantity</label>
          <input type="number" min={1} className={inputClass} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
        </div>
        <div>
          <label className={labelClass}>First refill date</label>
          <input type="date" className={inputClass} value={firstRefillDate} onChange={(e) => setFirstRefillDate(e.target.value)} required />
        </div>
      </div>

      <div className="rounded-md border border-[#101f15]/10 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[#101f15]">
          <input type="checkbox" checked={hasSchedule} onChange={(e) => setHasSchedule(e.target.checked)} />
          Recurring refill
        </label>
        {hasSchedule && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Every (days)</label>
              <input
                type="number"
                min={1}
                max={365}
                className={inputClass}
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className={secondaryBtnClass} onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create" : "Save"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import type {
  AppointmentDto,
  CreateAppointmentDto,
  RecurrenceFrequency,
  UpdateAppointmentDto,
} from "@health-portal/shared";
import { RECURRENCE_FREQUENCIES } from "@health-portal/shared";
import { inputClass, labelClass, primaryBtnClass, secondaryBtnClass } from "./forms";

type Props =
  | {
      mode: "create";
      patientId: string;
      onSubmit: (data: CreateAppointmentDto) => Promise<void>;
      onCancel: () => void;
      initial?: undefined;
    }
  | {
      mode: "edit";
      initial: AppointmentDto;
      onSubmit: (data: UpdateAppointmentDto) => Promise<void>;
      onCancel: () => void;
    };

/** Convert ISO UTC string to value for <input type="datetime-local">. */
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AppointmentForm(props: Props) {
  const { mode, onSubmit, onCancel } = props;
  const initial = mode === "edit" ? props.initial : undefined;

  const [providerName, setProviderName] = useState(initial?.providerName ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [firstAppointment, setFirstAppointment] = useState(
    initial ? isoToLocalInput(initial.firstAppointment) : "",
  );
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 30);
  const [hasRecurrence, setHasRecurrence] = useState(initial?.recurrence != null);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    initial?.recurrence?.frequency ?? "weekly",
  );
  const [endDate, setEndDate] = useState(initial?.recurrence?.endDate ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const iso = new Date(firstAppointment).toISOString();
      const recurrence = hasRecurrence ? { frequency, endDate } : undefined;

      if (mode === "create") {
        await onSubmit({
          patientId: props.patientId,
          providerName,
          description,
          firstAppointment: iso,
          durationMinutes,
          recurrence,
        });
      } else {
        await onSubmit({
          providerName,
          description,
          firstAppointment: iso,
          durationMinutes,
          recurrence: hasRecurrence ? { frequency, endDate } : null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save appointment.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className={labelClass}>Provider</label>
        <input className={inputClass} value={providerName} onChange={(e) => setProviderName(e.target.value)} required />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First appointment</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={firstAppointment}
            onChange={(e) => setFirstAppointment(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Duration (min)</label>
          <input
            type="number"
            min={5}
            max={480}
            className={inputClass}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="rounded-md border border-[#101f15]/10 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[#101f15]">
          <input type="checkbox" checked={hasRecurrence} onChange={(e) => setHasRecurrence(e.target.checked)} />
          Recurring
        </label>
        {hasRecurrence && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Frequency</label>
              <select
                className={inputClass}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
              >
                {RECURRENCE_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input
                type="date"
                className={inputClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required={hasRecurrence}
              />
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

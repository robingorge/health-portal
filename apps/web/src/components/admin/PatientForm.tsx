"use client";

import { useState, type FormEvent } from "react";
import type {
  CreatePatientDto,
  PatientDto,
  UpdatePatientDto,
} from "@health-portal/shared";
import { BLOOD_TYPES } from "@health-portal/shared";
import { inputClass, labelClass, primaryBtnClass, secondaryBtnClass } from "./forms";

type PatientFormProps =
  | {
      mode: "create";
      onSubmit: (data: CreatePatientDto) => Promise<void>;
      onCancel: () => void;
      initial?: undefined;
    }
  | {
      mode: "edit";
      initial: PatientDto;
      onSubmit: (data: UpdatePatientDto) => Promise<void>;
      onCancel: () => void;
    };

export function PatientForm(props: PatientFormProps) {
  const { mode, onSubmit, onCancel } = props;
  const initial = mode === "edit" ? props.initial : undefined;

  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? "");
  const [bloodType, setBloodType] = useState(initial?.bloodType ?? "A+");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "create") {
        await onSubmit({
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          bloodType,
          password,
        });
      } else {
        const payload: UpdatePatientDto = {
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          bloodType,
        };
        if (password) payload.password = password;
        await onSubmit(payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save patient.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First name</label>
          <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Last name</label>
          <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Date of birth</label>
          <input type="date" className={inputClass} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Blood type</label>
          <select className={inputClass} value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            {BLOOD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Password {mode === "edit" && <span className="text-[#101f15]/50">(leave blank to keep)</span>}
          </label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required={mode === "create"}
          />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className={secondaryBtnClass} onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className={primaryBtnClass} disabled={submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create patient" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

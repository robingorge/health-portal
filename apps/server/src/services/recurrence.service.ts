import type {
  AppointmentDto,
  AppointmentOccurrence,
  PrescriptionDto,
  RefillOccurrence,
  RecurrenceFrequency,
} from "@health-portal/shared";

/**
 * Safety cap: no single rule should ever produce more than this many
 * occurrences in a single window. Prevents pathological input (e.g. a daily
 * rule with a far-future endDate) from blowing up memory.
 */
const MAX_OCCURRENCES_PER_RULE = 1000;

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Add `months` calendar months in UTC, clamping the day-of-month to the last
 * day of the target month. e.g. Jan 31 + 1 month => Feb 28 (or Feb 29).
 * This avoids JS Date's default overflow behavior (Jan 31 + 1 => Mar 3).
 */
function addMonths(d: Date, months: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const seconds = d.getUTCSeconds();
  const ms = d.getUTCMilliseconds();

  const targetYear = y + Math.floor((m + months) / 12);
  const targetMonth = ((m + months) % 12 + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, lastDay);

  return new Date(Date.UTC(targetYear, targetMonth, clampedDay, hours, minutes, seconds, ms));
}

function stepAppointmentDate(d: Date, freq: RecurrenceFrequency): Date {
  switch (freq) {
    case "daily":
      return addDays(d, 1);
    case "weekly":
      return addDays(d, 7);
    case "biweekly":
      return addDays(d, 14);
    case "monthly":
      return addMonths(d, 1);
  }
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Parse a YYYY-MM-DD string as end-of-day UTC so that an endDate of
 * "2026-04-30" includes the entire 30th.
 */
function parseEndOfDayUtc(yyyyMmDd: string): Date {
  return new Date(`${yyyyMmDd}T23:59:59.999Z`);
}

/**
 * Parse a YYYY-MM-DD string as start-of-day UTC.
 */
function parseStartOfDayUtc(yyyyMmDd: string): Date {
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

export const recurrenceService = {
  /**
   * Expand AppointmentDto records into concrete occurrences that fall within
   * [windowStart, windowEnd]. Occurrences strictly before windowStart (past)
   * are skipped. Occurrences after recurrence.endDate are also skipped.
   *
   * Non-recurring appointments produce exactly one occurrence if firstAppointment
   * lies in the window.
   */
  expandAppointments(
    appointments: AppointmentDto[],
    windowStart: Date,
    windowEnd: Date,
  ): AppointmentOccurrence[] {
    const out: AppointmentOccurrence[] = [];

    for (const appt of appointments) {
      const first = new Date(appt.firstAppointment);
      const ruleEnd = appt.recurrence ? parseEndOfDayUtc(appt.recurrence.endDate) : null;
      const effectiveEnd = ruleEnd && ruleEnd < windowEnd ? ruleEnd : windowEnd;

      let current = first;
      let iterations = 0;

      while (current.getTime() <= effectiveEnd.getTime() && iterations < MAX_OCCURRENCES_PER_RULE) {
        if (current.getTime() >= windowStart.getTime()) {
          out.push({
            appointmentId: appt.id,
            patientId: appt.patientId,
            providerName: appt.providerName,
            description: appt.description,
            date: current.toISOString(),
            durationMinutes: appt.durationMinutes,
          });
        }
        if (!appt.recurrence) break;
        current = stepAppointmentDate(current, appt.recurrence.frequency);
        iterations += 1;
      }
    }

    out.sort((a, b) => a.date.localeCompare(b.date));
    return out;
  },

  /**
   * Expand PrescriptionDto records into refill occurrences within
   * [windowStart, windowEnd]. firstRefillDate is the first occurrence; each
   * subsequent occurrence is `refillSchedule.frequencyDays` later. Without a
   * refillSchedule, only firstRefillDate is emitted (once, if in window).
   */
  expandRefills(
    prescriptions: PrescriptionDto[],
    windowStart: Date,
    windowEnd: Date,
  ): RefillOccurrence[] {
    const out: RefillOccurrence[] = [];

    for (const rx of prescriptions) {
      const first = parseStartOfDayUtc(rx.firstRefillDate);
      const ruleEnd = rx.refillSchedule ? parseEndOfDayUtc(rx.refillSchedule.endDate) : null;
      const effectiveEnd = ruleEnd && ruleEnd < windowEnd ? ruleEnd : windowEnd;

      let current = first;
      let iterations = 0;

      while (current.getTime() <= effectiveEnd.getTime() && iterations < MAX_OCCURRENCES_PER_RULE) {
        if (current.getTime() >= windowStart.getTime()) {
          out.push({
            prescriptionId: rx.id,
            patientId: rx.patientId,
            medicationName: rx.medicationName,
            dosage: rx.dosage,
            date: toDateOnly(current),
          });
        }
        if (!rx.refillSchedule) break;
        current = addDays(current, rx.refillSchedule.frequencyDays);
        iterations += 1;
      }
    }

    out.sort((a, b) => a.date.localeCompare(b.date));
    return out;
  },
};

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

/**
 * The n-th occurrence of a recurrence, computed relative to the original
 * anchor date. Monthly recurrences MUST use this (not iterative stepping)
 * to preserve the original day-of-month: Jan 31 + 1mo => Feb 28,
 * Jan 31 + 2mo => Mar 31 (not Mar 28, which is what chaining through the
 * clamped Feb 28 would produce).
 */
function occurrenceAt(anchor: Date, freq: RecurrenceFrequency, n: number): Date {
  switch (freq) {
    case "daily":
      return addDays(anchor, n);
    case "weekly":
      return addDays(anchor, n * 7);
    case "biweekly":
      return addDays(anchor, n * 14);
    case "monthly":
      return addMonths(anchor, n);
  }
}

/** Fixed day-step for day-based frequencies; null for calendar-based (monthly). */
function dayStepFor(freq: RecurrenceFrequency): number | null {
  switch (freq) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return null;
  }
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Advance `from` by k * stepDays so the result is the first occurrence
 * >= target. O(1).
 */
function fastForwardDays(from: Date, target: Date, stepDays: number): Date {
  if (from.getTime() >= target.getTime()) return from;
  const diffMs = target.getTime() - from.getTime();
  const stepMs = stepDays * MS_PER_DAY;
  const k = Math.ceil(diffMs / stepMs);
  return new Date(from.getTime() + k * stepMs);
}

/**
 * Monthly fast-forward refinement bound. Does no allocation, terminates in
 * O(years * 12) even on absurd input.
 */
const MAX_CATCHUP_ITERATIONS = 100_000;

/**
 * Find the smallest n such that `occurrenceAt(anchor, "monthly", n)` lands
 * on or after `target`. Uses a coarse approximation (calendar-month diff)
 * then refines, so it's O(1) in practice even for decade-old anchors.
 */
function firstMonthlyIndexAtOrAfter(anchor: Date, target: Date): number {
  const monthDiff =
    (target.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    (target.getUTCMonth() - anchor.getUTCMonth());
  let n = Math.max(0, monthDiff);
  let iters = 0;
  // Refine forward if clamping made the candidate land before target.
  while (
    occurrenceAt(anchor, "monthly", n).getTime() < target.getTime() &&
    iters < MAX_CATCHUP_ITERATIONS
  ) {
    n += 1;
    iters += 1;
  }
  // Refine backward if our approximation overshot (shouldn't happen after
  // Math.max(0, ...), but guards against unexpected edge cases).
  while (n > 0 && occurrenceAt(anchor, "monthly", n - 1).getTime() >= target.getTime()) {
    n -= 1;
  }
  return n;
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

      // Non-recurring: single candidate, emit iff in window.
      if (!appt.recurrence) {
        if (first.getTime() >= windowStart.getTime() && first.getTime() <= effectiveEnd.getTime()) {
          out.push({
            appointmentId: appt.id,
            patientId: appt.patientId,
            providerName: appt.providerName,
            description: appt.description,
            date: first.toISOString(),
            durationMinutes: appt.durationMinutes,
          });
        }
        continue;
      }

      // All occurrences are computed from the original anchor (`first`) via
      // `occurrenceAt`. This preserves the original day-of-month across
      // monthly expansions — chaining through clamped dates (Jan 31 → Feb 28
      // → Mar 28) would drift and is NOT used here.
      const freq = appt.recurrence.frequency;

      // Find the first index `n` whose occurrence lands in-window.
      let n = 0;
      if (first.getTime() < windowStart.getTime()) {
        const stepDays = dayStepFor(freq);
        if (stepDays !== null) {
          const diffMs = windowStart.getTime() - first.getTime();
          n = Math.ceil(diffMs / (stepDays * MS_PER_DAY));
        } else {
          n = firstMonthlyIndexAtOrAfter(first, windowStart);
        }
      }

      let emitted = 0;
      while (emitted < MAX_OCCURRENCES_PER_RULE) {
        const current = occurrenceAt(first, freq, n);
        if (current.getTime() > effectiveEnd.getTime()) break;
        if (current.getTime() >= windowStart.getTime()) {
          out.push({
            appointmentId: appt.id,
            patientId: appt.patientId,
            providerName: appt.providerName,
            description: appt.description,
            date: current.toISOString(),
            durationMinutes: appt.durationMinutes,
          });
          emitted += 1;
        }
        n += 1;
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

    // Refill dates are day-granular (YYYY-MM-DD, floored to UTC midnight).
    // Floor the window start to the same granularity so a refill dated "today"
    // is still considered in-window after midnight UTC.
    const refillWindowStart = new Date(Date.UTC(
      windowStart.getUTCFullYear(),
      windowStart.getUTCMonth(),
      windowStart.getUTCDate(),
    ));

    for (const rx of prescriptions) {
      const first = parseStartOfDayUtc(rx.firstRefillDate);
      const ruleEnd = rx.refillSchedule ? parseEndOfDayUtc(rx.refillSchedule.endDate) : null;
      const effectiveEnd = ruleEnd && ruleEnd < windowEnd ? ruleEnd : windowEnd;

      // Fast-forward past historical refills so they don't consume the emit cap.
      let current = first;
      if (rx.refillSchedule && current.getTime() < refillWindowStart.getTime()) {
        current = fastForwardDays(current, refillWindowStart, rx.refillSchedule.frequencyDays);
      }

      let emitted = 0;
      while (current.getTime() <= effectiveEnd.getTime() && emitted < MAX_OCCURRENCES_PER_RULE) {
        if (current.getTime() >= refillWindowStart.getTime()) {
          out.push({
            prescriptionId: rx.id,
            patientId: rx.patientId,
            medicationName: rx.medicationName,
            dosage: rx.dosage,
            date: toDateOnly(current),
          });
          emitted += 1;
        }
        if (!rx.refillSchedule) break;
        current = addDays(current, rx.refillSchedule.frequencyDays);
      }
    }

    out.sort((a, b) => a.date.localeCompare(b.date));
    return out;
  },
};

/**
 * Shared date-window helpers for portal read endpoints.
 *
 * All windows are half-open on the upper bound conceptually, but because we
 * use inclusive comparisons (`<=`) during occurrence expansion, callers should
 * treat `end` as "last moment to include". `start` is inclusive.
 *
 * Times are always in UTC to keep occurrence expansion deterministic and
 * independent of the server's local timezone.
 */

export type DateWindow = {
  start: Date;
  end: Date;
};

export function next7Days(from: Date = new Date()): DateWindow {
  const start = new Date(from);
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

/**
 * Add `months` calendar months in UTC, clamping the day-of-month to the last
 * valid day of the target month so month-end dates don't overflow into the
 * following month (e.g. Jan 31 + 3mo => Apr 30, not May 1).
 */
function addMonthsClamped(d: Date, months: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const targetYear = y + Math.floor((m + months) / 12);
  const targetMonth = ((m + months) % 12 + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(
    targetYear,
    targetMonth,
    Math.min(day, lastDay),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  ));
}

export function next3Months(from: Date = new Date()): DateWindow {
  const start = new Date(from);
  const end = addMonthsClamped(start, 3);
  return { start, end };
}

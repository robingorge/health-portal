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

export function next3Months(from: Date = new Date()): DateWindow {
  const start = new Date(from);
  const end = new Date(from);
  end.setUTCMonth(end.getUTCMonth() + 3);
  return { start, end };
}

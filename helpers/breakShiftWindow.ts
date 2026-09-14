/**
 * Shared helpers: a break may only be attached to a shift when its
 * configured start/end fall completely inside the shift working hours.
 */

export function timeToMinutes(value?: string | null): number | null {
  if (!value) return null;
  const normalized = String(value).trim();
  const ampm = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let hours = parseInt(ampm[1], 10);
    const minutes = parseInt(ampm[2], 10);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const parts = normalized.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function doesBreakFitShiftWindow(
  breakStart?: string | null,
  breakEnd?: string | null,
  shiftStart?: string | null,
  shiftEnd?: string | null,
): boolean {
  const start = timeToMinutes(breakStart);
  const end = timeToMinutes(breakEnd);
  const shiftStartMin = timeToMinutes(shiftStart);
  const shiftEndMin = timeToMinutes(shiftEnd);
  if (
    start === null ||
    end === null ||
    shiftStartMin === null ||
    shiftEndMin === null ||
    start >= end
  ) {
    return false;
  }
  return start >= shiftStartMin && end <= shiftEndMin;
}

export function shiftDurationHours(
  startTime?: string | null,
  endTime?: string | null,
): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start === null || end === null || end <= start) {
    return 0;
  }
  return Number(((end - start) / 60).toFixed(1));
}

export const BREAK_OUTSIDE_SHIFT_WARNING =
  'Break time must fit completely within the shift working hours. Shifts that do not include this break window cannot be selected.';

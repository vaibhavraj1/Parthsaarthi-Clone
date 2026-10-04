/**
 * Time and Timezone utilities for Parthsaarthi Scheduled Slot Release.
 * Authoritative timezone: Asia/Kolkata (IST, UTC+5:30).
 */

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Generate 24-hour time strings at given interval in minutes (default 5 min).
 * e.g., ["00:00", "00:05", "00:10", ..., "23:55"]
 */
export function generate24HourTimeOptions(intervalMinutes: number = 5): string[] {
  const times: string[] = [];
  for (let m = 0; m < 24 * 60; m += intervalMinutes) {
    const hours = Math.floor(m / 60);
    const minutes = m % 60;
    times.push(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    );
  }
  return times;
}

/**
 * Convert "HH:mm" 24-hr time to minutes since midnight.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // Handle if it has AM/PM
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const isPM = timeStr.includes('PM');
    const clean = timeStr.replace(/AM|PM/g, '').trim();
    const [h, m] = clean.split(':').map(Number);
    return ((h % 12) + (isPM ? 12 : 0)) * 60 + (m || 0);
  }
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Convert minutes since midnight back to "HH:mm" (24-hr format).
 */
export function minutesToTime(mins: number): string {
  const normalized = ((mins % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Check if time1 is strictly before time2 (both "HH:mm").
 */
export function isTimeBefore(time1: string, time2: string): boolean {
  return timeToMinutes(time1) < timeToMinutes(time2);
}

/**
 * Check if two time ranges overlap.
 * Range 1: [start1, end1), Range 2: [start2, end2)
 */
export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

/**
 * Format an ISO date string or Date object into human-readable IST string.
 * e.g., "07 Oct 2026, 14:00 IST"
 */
export function formatToIST(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formatted = new Intl.DateTimeFormat('en-IN', options).format(date);
  return `${formatted} IST`;
}

/**
 * Format only the time in IST (24-hour clock).
 * e.g., "14:00"
 */
export function formatTimeIST(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

/**
 * Format only the date in IST.
 * e.g., "07 Oct 2026"
 */
export function formatDateIST(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

/**
 * Converts IST date string ("YYYY-MM-DD") and 24-hr time string ("HH:mm")
 * into a UTC ISO string.
 */
export function istToUtcIso(dateStr: string, timeStr: string): string {
  let hours = 0;
  let minutes = 0;

  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const isPM = timeStr.includes('PM');
    const clean = timeStr.replace(/AM|PM/g, '').trim();
    const parts = clean.split(':').map(Number);
    hours = (parts[0] % 12) + (isPM ? 12 : 0);
    minutes = parts[1] || 0;
  } else {
    const parts = timeStr.split(':').map(Number);
    hours = parts[0] || 0;
    minutes = parts[1] || 0;
  }

  const paddedH = String(hours).padStart(2, '0');
  const paddedM = String(minutes).padStart(2, '0');

  // Construct ISO string with +05:30 offset
  const istIso = `${dateStr}T${paddedH}:${paddedM}:00+05:30`;
  const date = new Date(istIso);
  return date.toISOString();
}

/**
 * Get current date and 24-hr time in IST.
 */
export function getCurrentISTParts(offsetMinutes = 0, roundToNearest5 = true): {
  date: string;
  time: string;
} {
  const now = new Date(Date.now() + offsetMinutes * 60 * 1000);

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '10';
  const day = parts.find((p) => p.type === 'day')?.value || '04';
  let hourNum = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10);
  let minNum = parseInt(parts.find((p) => p.type === 'minute')?.value || '00', 10);

  if (roundToNearest5) {
    const rem = minNum % 5;
    if (rem !== 0) {
      minNum += 5 - rem;
      if (minNum >= 60) {
        minNum = 0;
        hourNum = (hourNum + 1) % 24;
      }
    }
  }

  const paddedH = String(hourNum).padStart(2, '0');
  const paddedM = String(minNum).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${paddedH}:${paddedM}`,
  };
}

/**
 * Calculates remaining countdown values.
 */
export function calculateRemainingTime(targetIso: string, currentIso?: string) {
  const target = new Date(targetIso).getTime();
  const current = currentIso ? new Date(currentIso).getTime() : Date.now();
  const diff = target - current;

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isPassed: true,
      formatted: '00:00:00',
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isPassed: false,
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}

/**
 * Time and Timezone utilities for Parthsaarthi Scheduled Slot Release.
 * Authoritative timezone: Asia/Kolkata (IST, UTC+5:30).
 */

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Format an ISO date string or Date object into human-readable IST string.
 * e.g., "07 Oct 2026, 02:00 PM IST"
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
    hour12: true,
  };

  const formatted = new Intl.DateTimeFormat('en-IN', options).format(date);
  return `${formatted} IST`;
}

/**
 * Format only the time in IST.
 * e.g., "02:00 PM IST"
 */
export function formatTimeIST(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
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
 * Converts IST date string ("YYYY-MM-DD") and time string ("HH:mm" in 24hr or "hh:mm AM/PM")
 * into a UTC ISO string.
 * Example: Date "2026-10-07" + Time "14:00" in IST -> "2026-10-07T08:30:00.000Z"
 */
export function istToUtcIso(dateStr: string, timeStr: string): string {
  // Normalize time string (HH:mm)
  let hours = 0;
  let minutes = 0;

  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const isPM = timeStr.includes('PM');
    const clean = timeStr.replace(/AM|PM/g, '').trim();
    const parts = clean.split(':').map(Number);
    hours = parts[0] % 12 + (isPM ? 12 : 0);
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
 * Get current date and time in IST formatted for HTML inputs.
 * Date: "YYYY-MM-DD"
 * Time: "HH:mm" (24h)
 */
export function getCurrentISTParts(offsetMinutes = 0): { date: string; time: string } {
  const now = new Date(Date.now() + offsetMinutes * 60 * 1000);
  
  // Format parts according to Asia/Kolkata
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
  const day = parts.find((p) => p.type === 'day')?.value || '07';
  let hour = parts.find((p) => p.type === 'hour')?.value || '14';
  if (hour === '24') hour = '00';
  const minute = parts.find((p) => p.type === 'minute')?.value || '00';

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
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

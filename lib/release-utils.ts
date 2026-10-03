import { Release, ReleaseStatus } from '@/models/types';

/**
 * Computes authoritative release status based on database state and current server timestamp.
 *
 * CRITICAL BUSINESS RULES:
 * 1. Cancelled releases remain 'cancelled' forever; they NEVER open even if releaseAt passed.
 * 2. Manually released releases remain 'manually_released' (or 'open') immediately.
 * 3. Completed releases remain 'completed'.
 * 4. For releases with status 'scheduled':
 *    - If currentServerTime >= releaseAt: status is computed as 'open'.
 *    - Otherwise: status remains 'scheduled'.
 */
export function computeReleaseStatus(
  release: Pick<Release, 'status' | 'releaseAt'>,
  currentServerTime: Date = new Date()
): ReleaseStatus {
  // Cancelled releases must never become open
  if (release.status === 'cancelled') {
    return 'cancelled';
  }

  // Completed releases
  if (release.status === 'completed') {
    return 'completed';
  }

  // Explicit manual release
  if (release.status === 'manually_released') {
    return 'manually_released';
  }

  // Already marked open
  if (release.status === 'open') {
    return 'open';
  }

  // Scheduled releases: evaluate against authoritative server time
  if (release.status === 'scheduled') {
    const releaseTime = new Date(release.releaseAt).getTime();
    const serverTime = currentServerTime.getTime();

    if (serverTime >= releaseTime) {
      return 'open';
    }
    return 'scheduled';
  }

  return release.status;
}

/**
 * Determines whether slots belonging to a release can be booked right now.
 */
export function isReleaseBookable(
  release: Pick<Release, 'status' | 'releaseAt'>,
  currentServerTime: Date = new Date()
): boolean {
  const computed = computeReleaseStatus(release, currentServerTime);
  return computed === 'open' || computed === 'manually_released';
}

/**
 * Friendly status badge color mapping and label.
 */
export function getStatusDisplay(status: ReleaseStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'scheduled':
      return {
        label: 'SCHEDULED',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'open':
      return {
        label: 'OPEN',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'manually_released':
      return {
        label: 'MANUALLY RELEASED',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'cancelled':
      return {
        label: 'CANCELLED',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'completed':
      return {
        label: 'COMPLETED',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: String(status).toUpperCase(),
        badgeClass: 'bg-gray-50 text-gray-800 border-gray-200',
        dotClass: 'bg-gray-400',
      };
  }
}

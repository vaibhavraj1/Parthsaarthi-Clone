import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { computeReleaseStatus, isReleaseBookable } from '@/lib/release-utils';
import { Release, Slot, ReleaseWithSlots } from '@/models/types';

export const dynamic = 'force-dynamic';

// GET /api/student/releases: Authoritative student releases list
export async function GET(req: NextRequest) {
  try {
    const { db } = await getDatabase();
    const serverTime = new Date();

    // Query all releases (exclude deleted if any, show scheduled, open, manually_released, cancelled)
    const releasesCursor = await db.collection('releases').find({});
    const releases = await releasesCursor.toArray();

    const studentReleases: ReleaseWithSlots[] = await Promise.all(
      releases.map(async (rel: any) => {
        // Authoritative server-side status computation
        const computedStatus = computeReleaseStatus(rel, serverTime);
        const bookable = isReleaseBookable(rel, serverTime);

        // Fetch slots
        const slotsCursor = await db.collection('slots').find({ releaseId: rel._id });
        const slots = await slotsCursor.toArray();

        return {
          ...rel,
          slots: slots as Slot[],
          computedStatus,
          isBookable: bookable,
          serverTime: serverTime.toISOString(),
        };
      })
    );

    // Sort: open/scheduled first, cancelled last, by releaseAt
    studentReleases.sort((a, b) => {
      if (a.computedStatus === 'cancelled' && b.computedStatus !== 'cancelled') return 1;
      if (b.computedStatus === 'cancelled' && a.computedStatus !== 'cancelled') return -1;
      return new Date(a.releaseAt).getTime() - new Date(b.releaseAt).getTime();
    });

    return NextResponse.json({
      releases: studentReleases,
      serverTime: serverTime.toISOString(),
    });
  } catch (error: any) {
    console.error('Error in student releases endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student releases' },
      { status: 500 }
    );
  }
}

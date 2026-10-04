import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { computeReleaseStatus, isReleaseBookable } from '@/lib/release-utils';
import { timeToMinutes, doTimesOverlap } from '@/lib/time-utils';
import { Release, Slot } from '@/models/types';

export const dynamic = 'force-dynamic';

// GET /api/releases: List all releases with slots count and computed status
export async function GET(req: NextRequest) {
  try {
    const { db } = await getDatabase();
    const serverTime = new Date();

    const releasesCursor = await db.collection('releases').find({});
    const releases = await releasesCursor.toArray();

    // Fetch slots for each release
    const releasesWithDetails = await Promise.all(
      releases.map(async (rel: any) => {
        const slotsCursor = await db.collection('slots').find({ releaseId: rel._id });
        const slots = await slotsCursor.toArray();
        const computedStatus = computeReleaseStatus(rel, serverTime);
        const bookable = isReleaseBookable(rel, serverTime);

        return {
          ...rel,
          slotsCount: slots.length,
          slots,
          computedStatus,
          isBookable: bookable,
          serverTime: serverTime.toISOString(),
        };
      })
    );

    // Sort by createdAt descending
    releasesWithDetails.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      releases: releasesWithDetails,
      serverTime: serverTime.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching releases:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching releases' },
      { status: 500 }
    );
  }
}

// POST /api/releases: Create a new release and its slots
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category = 'Peer Mentoring',
      releaseOption = 'scheduled', // 'now' | 'scheduled'
      releaseAt,
      slots,
    } = body;

    // Validation
    const cleanTitle = (title && typeof title === 'string' && title.trim()) ? title.trim() : 'Mentorship Release by Gayathri Arvind';

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { error: 'At least one slot must be provided for the release.' },
        { status: 400 }
      );
    }

    // Validate each slot timings & check for overlaps
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (!s.startTime || !s.endTime) {
        return NextResponse.json(
          { error: `Slot #${i + 1} has invalid start or end time.` },
          { status: 400 }
        );
      }
      if (timeToMinutes(s.startTime) >= timeToMinutes(s.endTime)) {
        return NextResponse.json(
          { error: `Slot #${i + 1} (${s.startTime} – ${s.endTime}): End time must be strictly after start time.` },
          { status: 400 }
        );
      }

      if (s.slotType === 'case') {
        const shadowCount = Number(s.shadowCount ?? 2);
        if (!Number.isInteger(shadowCount) || shadowCount < 0 || shadowCount > 15) {
          return NextResponse.json(
            { error: `Slot #${i + 1} shadow count must be between 0 and 15.` },
            { status: 400 }
          );
        }
      }

      // Overlap check with previous slots
      for (let j = 0; j < i; j++) {
        const prev = slots[j];
        if (doTimesOverlap(s.startTime, s.endTime, prev.startTime, prev.endTime)) {
          return NextResponse.json(
            {
              error: `Slot #${i + 1} (${s.startTime} – ${s.endTime}) overlaps with Slot #${j + 1} (${prev.startTime} – ${prev.endTime}). Mentoring slots cannot overlap.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Determine release status and timestamp
    const now = new Date();
    let finalReleaseAt: string;
    let finalStatus: 'open' | 'scheduled';

    if (releaseOption === 'now') {
      finalReleaseAt = now.toISOString();
      finalStatus = 'open';
    } else {
      if (!releaseAt || isNaN(new Date(releaseAt).getTime())) {
        return NextResponse.json(
          { error: 'Valid scheduled release date and time is required.' },
          { status: 400 }
        );
      }
      finalReleaseAt = new Date(releaseAt).toISOString();
      finalStatus = 'scheduled';
    }

    const { db } = await getDatabase();
    const releaseId = 'rel_' + Math.random().toString(36).substring(2, 10);

    const newRelease: Release = {
      _id: releaseId,
      mentorId: 'mentor_pgp41',
      mentorName: 'Gayathri Arvind',
      title: cleanTitle,
      description: description?.trim() || '',
      category: category?.trim() || 'Peer Mentoring',
      releaseAt: finalReleaseAt,
      status: finalStatus,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await db.collection('releases').insertOne(newRelease);

    // Insert associated slots
    const slotsToInsert = slots.map((s: any, idx: number) => {
      const slotType = s.slotType === 'case' ? 'case' : 'cv_hr';
      const shadowCount = slotType === 'case' ? Number(s.shadowCount ?? 2) : 0;

      return {
        _id: 'slot_' + Math.random().toString(36).substring(2, 10) + `_${idx}`,
        releaseId: releaseId,
        startTime: s.startTime,
        endTime: s.endTime,
        mode: s.mode === 'Offline' ? 'Offline' : 'Online',
        slotType: slotType,
        ...(slotType === 'case' ? { shadowCount } : {}),
        solverBooked: false,
        shadowsBooked: [],
        isBooked: false,
        location: s.location?.trim() || '',
        note: s.note?.trim() || '',
        createdAt: now.toISOString(),
      };
    });

    await db.collection('slots').insertMany(slotsToInsert);

    const computedStatus = computeReleaseStatus(newRelease, now);

    return NextResponse.json(
      {
        message: 'Release created successfully',
        release: {
          ...newRelease,
          slots: slotsToInsert,
          computedStatus,
          isBookable: computedStatus === 'open',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating release:', error);
    return NextResponse.json(
      { error: 'Failed to create release: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

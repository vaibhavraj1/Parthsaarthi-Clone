import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { computeReleaseStatus, isReleaseBookable } from '@/lib/release-utils';
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
    const { title, description, mentorName, category, releaseAt, slots } = body;

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Session title is required.' }, { status: 400 });
    }
    if (!releaseAt || isNaN(new Date(releaseAt).getTime())) {
      return NextResponse.json(
        { error: 'Valid scheduled release date and time is required.' },
        { status: 400 }
      );
    }
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { error: 'At least one slot must be provided for the release.' },
        { status: 400 }
      );
    }

    const { db } = await getDatabase();
    const now = new Date().toISOString();
    const releaseId = 'rel_' + Math.random().toString(36).substring(2, 10);

    const newRelease: Release = {
      _id: releaseId,
      mentorId: 'mentor_rahul',
      mentorName: mentorName?.trim() || 'Rahul Sharma',
      title: title.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'General Mentoring',
      releaseAt: new Date(releaseAt).toISOString(),
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('releases').insertOne(newRelease);

    // Insert associated individual slots
    const slotsToInsert = slots.map((s: any, idx: number) => ({
      _id: 'slot_' + Math.random().toString(36).substring(2, 10) + `_${idx}`,
      releaseId: releaseId,
      startTime: s.startTime?.trim() || '03:00 PM',
      endTime: s.endTime?.trim() || '03:30 PM',
      mode: s.mode?.trim() || 'Online (Google Meet)',
      location: s.location?.trim() || '',
      note: s.note?.trim() || '',
      isBooked: false,
      createdAt: now,
    }));

    await db.collection('slots').insertMany(slotsToInsert);

    const computedStatus = computeReleaseStatus(newRelease, new Date());

    return NextResponse.json(
      {
        message: 'Release scheduled successfully',
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

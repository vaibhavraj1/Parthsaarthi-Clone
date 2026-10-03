import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { computeReleaseStatus, isReleaseBookable } from '@/lib/release-utils';

interface RouteParams {
  params: { id: string };
}

// GET /api/releases/[id]: Retrieve a release and its slots
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { db } = await getDatabase();
    const serverTime = new Date();

    const release = await db.collection('releases').findOne({ _id: id });
    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    const slotsCursor = await db.collection('slots').find({ releaseId: id });
    const slots = await slotsCursor.toArray();

    const computedStatus = computeReleaseStatus(release, serverTime);
    const bookable = isReleaseBookable(release, serverTime);

    return NextResponse.json({
      release: {
        ...release,
        slots,
        computedStatus,
        isBookable: bookable,
        serverTime: serverTime.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching release:', error);
    return NextResponse.json(
      { error: 'Failed to fetch release' },
      { status: 500 }
    );
  }
}

// PATCH /api/releases/[id]: Edit a scheduled release
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();
    const { title, description, category, releaseAt } = body;

    const { db } = await getDatabase();
    const release = await db.collection('releases').findOne({ _id: id });

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    if (release.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot modify a cancelled release.' },
        { status: 400 }
      );
    }

    const updateFields: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title && title.trim()) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (category !== undefined) updateFields.category = category.trim();
    if (releaseAt && !isNaN(new Date(releaseAt).getTime())) {
      updateFields.releaseAt = new Date(releaseAt).toISOString();
    }

    await db.collection('releases').updateOne(
      { _id: id },
      { $set: updateFields }
    );

    const updatedRelease = await db.collection('releases').findOne({ _id: id });
    const computedStatus = computeReleaseStatus(updatedRelease, new Date());

    return NextResponse.json({
      message: 'Release updated successfully',
      release: {
        ...updatedRelease,
        computedStatus,
      },
    });
  } catch (error: any) {
    console.error('Error updating release:', error);
    return NextResponse.json(
      { error: 'Failed to update release: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

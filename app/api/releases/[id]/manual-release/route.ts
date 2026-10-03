import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { computeReleaseStatus } from '@/lib/release-utils';

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { db } = await getDatabase();

    const release = await db.collection('releases').findOne({ _id: id });
    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    if (release.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot manually release a cancelled session.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    await db.collection('releases').updateOne(
      { _id: id },
      {
        $set: {
          status: 'manually_released',
          manuallyReleasedAt: now,
          updatedAt: now,
        },
      }
    );

    const updated = await db.collection('releases').findOne({ _id: id });
    const computedStatus = computeReleaseStatus(updated, new Date());

    return NextResponse.json({
      message: 'Slots released manually. They are now immediately bookable by students.',
      release: {
        ...updated,
        computedStatus,
        isBookable: true,
      },
    });
  } catch (error: any) {
    console.error('Error performing manual release:', error);
    return NextResponse.json(
      { error: 'Failed to perform manual release: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

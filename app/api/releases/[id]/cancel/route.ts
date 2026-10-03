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

    const now = new Date().toISOString();
    await db.collection('releases').updateOne(
      { _id: id },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: now,
          updatedAt: now,
        },
      }
    );

    const updated = await db.collection('releases').findOne({ _id: id });
    const computedStatus = computeReleaseStatus(updated, new Date());

    return NextResponse.json({
      message: 'Release has been cancelled. Slots will not become bookable.',
      release: {
        ...updated,
        computedStatus,
        isBookable: false,
      },
    });
  } catch (error: any) {
    console.error('Error cancelling release:', error);
    return NextResponse.json(
      { error: 'Failed to cancel release: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

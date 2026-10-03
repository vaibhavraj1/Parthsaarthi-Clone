import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { computeReleaseStatus } from '@/lib/release-utils';

interface RouteParams {
  params: { id: string };
}

// POST /api/releases/[id]/simulate-release
// DEMO ONLY: Simulates the arrival/passage of scheduled release time by shifting releaseAt to 1 minute in the past.
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
        { error: 'Cannot simulate release for a cancelled session.' },
        { status: 400 }
      );
    }

    // Set releaseAt to 1 minute ago to simulate time passed
    const pastTime = new Date(Date.now() - 60 * 1000).toISOString();
    await db.collection('releases').updateOne(
      { _id: id },
      {
        $set: {
          releaseAt: pastTime,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    const updated = await db.collection('releases').findOne({ _id: id });
    const computedStatus = computeReleaseStatus(updated, new Date());

    return NextResponse.json({
      message: 'DEMO SIMULATION: Release time simulated to past. Refresh student portal to see OPEN state.',
      release: {
        ...updated,
        computedStatus,
        isBookable: true,
      },
    });
  } catch (error: any) {
    console.error('Error simulating release:', error);
    return NextResponse.json(
      { error: 'Failed to simulate release: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

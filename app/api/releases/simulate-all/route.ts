import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// POST /api/releases/simulate-all
// DEMO ONLY: Simulates passage of release time for all scheduled releases
export async function POST(req: NextRequest) {
  try {
    const { db } = await getDatabase();
    const pastTime = new Date(Date.now() - 60 * 1000).toISOString();

    const result = await db.collection('releases').updateMany(
      { status: 'scheduled' },
      {
        $set: {
          releaseAt: pastTime,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      message: `DEMO SIMULATION: ${result.modifiedCount || 'All'} scheduled releases fast-forwarded to OPEN state.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error simulating all releases:', error);
    return NextResponse.json(
      { error: 'Failed to simulate releases: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

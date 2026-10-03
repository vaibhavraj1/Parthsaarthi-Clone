import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'seed_consulting';
    const { db } = await getDatabase();

    const now = new Date();
    // Default: release 3 minutes from now in IST
    const releaseAtDate = new Date(now.getTime() + 3 * 60 * 1000);
    const releaseId = 'demo_consulting_01';

    if (action === 'clean_reset') {
      await db.collection('releases').deleteMany({});
      await db.collection('slots').deleteMany({});
      await db.collection('bookings').deleteMany({});
    }

    // Insert or replace Consulting Case Preparation
    await db.collection('releases').deleteOne({ _id: releaseId });
    await db.collection('slots').deleteMany({ releaseId });
    await db.collection('bookings').deleteMany({});

    const demoRelease = {
      _id: releaseId,
      mentorId: 'mentor_rahul',
      mentorName: 'Rahul Sharma',
      title: 'Consulting Case Preparation',
      description:
        'Practice case interviews, discuss problem-solving approaches, and receive feedback for upcoming Tier-1 consulting SIP shortlists (McKinsey, BCG, Bain).',
      category: 'Management Consulting',
      releaseAt: releaseAtDate.toISOString(),
      status: 'scheduled',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await db.collection('releases').insertOne(demoRelease);

    const demoSlots = [
      {
        _id: 'slot_case_01',
        releaseId,
        startTime: '03:00 PM',
        endTime: '03:30 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'Profitability framework & live case',
        isBooked: false,
        createdAt: now.toISOString(),
      },
      {
        _id: 'slot_case_02',
        releaseId,
        startTime: '03:30 PM',
        endTime: '04:00 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'Market entry case & guesstimates',
        isBooked: false,
        createdAt: now.toISOString(),
      },
      {
        _id: 'slot_case_03',
        releaseId,
        startTime: '04:00 PM',
        endTime: '04:30 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'M&A and value chain analysis',
        isBooked: false,
        createdAt: now.toISOString(),
      },
      {
        _id: 'slot_case_04',
        releaseId,
        startTime: '04:30 PM',
        endTime: '05:00 PM',
        mode: 'Online (Google Meet)',
        location: 'Meet link provided after booking',
        note: 'Unconventional problem-solving & HR questions',
        isBooked: false,
        createdAt: now.toISOString(),
      },
    ];

    await db.collection('slots').insertMany(demoSlots);

    // Also seed another already-open session and another scheduled session for richness
    const openReleaseId = 'demo_finance_01';
    await db.collection('releases').deleteOne({ _id: openReleaseId });
    await db.collection('slots').deleteMany({ releaseId: openReleaseId });

    const openRelease = {
      _id: openReleaseId,
      mentorId: 'mentor_priya',
      mentorName: 'Priya Nambiar',
      title: 'Investment Banking & Valuation Q&A',
      description: 'DCF modeling, LBO fundamentals, and investment banking SIP preparation.',
      category: 'Finance & Banking',
      releaseAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), // 20 mins ago
      status: 'scheduled', // status scheduled + releaseAt in past => computes as OPEN!
      createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    };
    await db.collection('releases').insertOne(openRelease);

    await db.collection('slots').insertMany([
      {
        _id: 'slot_fin_01',
        releaseId: openReleaseId,
        startTime: '06:00 PM',
        endTime: '06:30 PM',
        mode: 'Offline (SR-102)',
        location: 'Seminar Room 102, Academic Block',
        note: 'Valuation & multiples discussion',
        isBooked: false,
        createdAt: now.toISOString(),
      },
      {
        _id: 'slot_fin_02',
        releaseId: openReleaseId,
        startTime: '06:30 PM',
        endTime: '07:00 PM',
        mode: 'Offline (SR-102)',
        location: 'Seminar Room 102, Academic Block',
        note: 'M&A pitch book review',
        isBooked: false,
        createdAt: now.toISOString(),
      },
    ]);

    return NextResponse.json({
      message: 'Demo dataset initialized successfully',
      activeReleaseId: releaseId,
      releaseAt: releaseAtDate.toISOString(),
    });
  } catch (error: any) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json(
      { error: 'Failed to reset demo data: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

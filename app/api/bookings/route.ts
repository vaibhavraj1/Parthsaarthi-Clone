import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isReleaseBookable } from '@/lib/release-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slotId, studentId = 'student_vaibhav', studentName = 'Vaibhav Raj Sahni' } = body;

    if (!slotId) {
      return NextResponse.json({ error: 'slotId is required.' }, { status: 400 });
    }

    const { db } = await getDatabase();
    const serverTime = new Date();

    // 1. Fetch the slot
    const slot = await db.collection('slots').findOne({ _id: slotId });
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found.' }, { status: 404 });
    }

    // 2. Fetch the parent release to check authoritative bookability
    const release = await db.collection('releases').findOne({ _id: slot.releaseId });
    if (!release) {
      return NextResponse.json({ error: 'Parent release not found.' }, { status: 404 });
    }

    // Server-side authoritative verification
    const bookable = isReleaseBookable(release, serverTime);
    if (!bookable) {
      return NextResponse.json(
        {
          error: 'Slot is locked! Booking opens at ' + new Date(release.releaseAt).toLocaleTimeString(),
        },
        { status: 403 }
      );
    }

    // 3. Check if already booked
    if (slot.isBooked) {
      return NextResponse.json(
        { error: 'This slot has already been booked by another student.' },
        { status: 409 }
      );
    }

    // Ensure unique booking record in database
    const existingBooking = await db.collection('bookings').findOne({ slotId });
    if (existingBooking) {
      return NextResponse.json(
        { error: 'This slot is already booked.' },
        { status: 409 }
      );
    }

    const bookingId = 'book_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    // Atomic update or insert
    await db.collection('bookings').insertOne({
      _id: bookingId,
      slotId,
      studentId,
      studentName,
      bookedAt: now,
    });

    await db.collection('slots').updateOne(
      { _id: slotId },
      {
        $set: {
          isBooked: true,
          bookedBy: studentName,
        },
      }
    );

    return NextResponse.json({
      message: 'Demo slot booked successfully! Seamless handoff to Parthsaarthi complete.',
      booking: {
        _id: bookingId,
        slotId,
        studentId,
        studentName,
        bookedAt: now,
      },
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to complete booking: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

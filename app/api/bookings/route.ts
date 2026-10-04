import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isReleaseBookable } from '@/lib/release-utils';
import { Booking } from '@/models/types';

export const dynamic = 'force-dynamic';

// GET /api/bookings?studentId=student_vaibhav
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || 'student_vaibhav';

    const { db } = await getDatabase();
    const bookingsCursor = await db.collection('bookings').find({ studentId });
    const bookings = await bookingsCursor.toArray();

    // Sort by bookedAt descending
    bookings.sort(
      (a: any, b: any) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    );

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/bookings: Book a slot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slotId,
      studentId = 'student_vaibhav',
      studentName = 'Vaibhav Raj Sahni',
      bookingRole,
      cvHrSelection,
    } = body;

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

    const now = new Date().toISOString();
    const bookingId = 'book_' + Math.random().toString(36).substring(2, 10);
    const slotType = slot.slotType || 'case';

    // 3. Handle slot type specific booking logic
    if (slotType === 'case') {
      if (bookingRole !== 'solver' && bookingRole !== 'shadow') {
        return NextResponse.json({ error: 'Choose Solver or Shadow before booking this case slot.' }, { status: 400 });
      }
      const isSolver = bookingRole === 'solver';
      const shadowCount = slot.shadowCount ?? 2;
      const currentShadows = slot.shadowsBooked || [];

      // Check if student already booked this slot
      if (slot.solverStudentId === studentId) {
        return NextResponse.json(
          { error: 'You have already booked the Solver spot for this slot.' },
          { status: 409 }
        );
      }
      if (currentShadows.some((s: any) => s.studentId === studentId)) {
        return NextResponse.json(
          { error: 'You have already booked a Shadow spot for this slot.' },
          { status: 409 }
        );
      }

      if (isSolver) {
        if (slot.solverBooked) {
          return NextResponse.json(
            { error: 'The Solver spot for this case slot has already been taken.' },
            { status: 409 }
          );
        }

        const willBeFullyBooked = currentShadows.length >= shadowCount;

        await db.collection('slots').updateOne(
          { _id: slotId },
          {
            $set: {
              solverBooked: true,
              solverStudentId: studentId,
              solverStudentName: studentName,
              isBooked: willBeFullyBooked,
              bookedBy: willBeFullyBooked ? studentName : slot.bookedBy,
            },
          }
        );
      } else {
        // Shadow booking
        if (shadowCount <= 0) {
          return NextResponse.json(
            { error: 'This case slot does not accept any shadows.' },
            { status: 400 }
          );
        }
        if (currentShadows.length >= shadowCount) {
          return NextResponse.json(
            { error: 'All shadow spots for this case slot are already filled.' },
            { status: 409 }
          );
        }

        const newShadowEntry = {
          studentId,
          studentName,
          bookedAt: now,
        };

        const willBeFullyBooked = Boolean(slot.solverBooked) && (currentShadows.length + 1 >= shadowCount);

        await db.collection('slots').updateOne(
          { _id: slotId },
          {
            $push: { shadowsBooked: newShadowEntry },
            $set: {
              isBooked: willBeFullyBooked,
            },
          }
        );
      }
    } else {
      // CV/HR Slot booking
      const cvHrOptions = ['Entire CV', 'Workex', 'POR', 'HR Questions'];
      if (!cvHrOptions.includes(cvHrSelection)) {
        return NextResponse.json({ error: 'Choose a CV/HR focus area before booking this slot.' }, { status: 400 });
      }
      if (slot.isBooked) {
        return NextResponse.json(
          { error: 'This CV/HR slot has already been booked.' },
          { status: 409 }
        );
      }

      await db.collection('slots').updateOne(
        { _id: slotId },
        {
          $set: {
            isBooked: true,
            bookedBy: studentName,
            bookedStudentId: studentId,
            cvHrSelection: cvHrSelection,
          },
        }
      );
    }

    // 4. Save booking record
    const newBooking: Booking = {
      _id: bookingId,
      slotId,
      releaseId: release._id,
      studentId,
      studentName,
      mentorName: release.mentorName || 'Gayathri Arvind',
      title: release.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      mode: slot.mode || 'Online',
      slotType: slotType,
      bookingRole: slotType === 'case' ? bookingRole : undefined,
      cvHrSelection: slotType === 'cv_hr' ? cvHrSelection : undefined,
      bookedAt: now,
    };

    await db.collection('bookings').insertOne(newBooking);

    return NextResponse.json({
      message: 'Booking confirmed successfully!',
      booking: newBooking,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to complete booking: ' + (error.message || 'Unknown') },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings: Cancel a booking
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const { db } = await getDatabase();
    const booking = await db.collection('bookings').findOne({ _id: bookingId });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Free the spot on the slot
    const slot = await db.collection('slots').findOne({ _id: booking.slotId });
    if (slot) {
      if (slot.slotType === 'case') {
        if (booking.bookingRole === 'solver') {
          await db.collection('slots').updateOne(
            { _id: slot._id },
            {
              $set: {
                solverBooked: false,
                solverStudentId: null,
                solverStudentName: null,
                isBooked: false,
              },
            }
          );
        } else {
          const updatedShadows = (slot.shadowsBooked || []).filter(
            (s: any) => s.studentId !== booking.studentId
          );
          await db.collection('slots').updateOne(
            { _id: slot._id },
            {
              $set: {
                shadowsBooked: updatedShadows,
                isBooked: false,
              },
            }
          );
        }
      } else {
        await db.collection('slots').updateOne(
          { _id: slot._id },
          {
            $set: {
              isBooked: false,
              bookedBy: null,
              bookedStudentId: null,
              cvHrSelection: null,
            },
          }
        );
      }
    }

    await db.collection('bookings').deleteOne({ _id: bookingId });

    return NextResponse.json({ message: 'Booking cancelled successfully.' });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking: ' + error.message },
      { status: 500 }
    );
  }
}

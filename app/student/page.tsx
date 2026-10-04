'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Booking, CvHrOption, ReleaseWithSlots, Slot } from '@/models/types';
import { ReleaseCard } from '@/components/ReleaseCard';
import { BookingModal } from '@/components/BookingModal';
import { RefreshCw, AlertCircle, Info, Calendar } from 'lucide-react';

const STUDENT_ID = 'student_vaibhav';
const STUDENT_NAME = 'Vaibhav Raj Sahni';

export default function StudentPage() {
  const [releases, setReleases] = useState<ReleaseWithSlots[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [serverTime, setServerTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'upcoming' | 'booked'>('upcoming');
  const [error, setError] = useState<string | null>(null);

  // Booking modal state
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseWithSlots | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReleases = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/student/releases');
      if (!res.ok) {
        throw new Error('Failed to load sessions from server');
      }
      const data = await res.json();
      setReleases(data.releases || []);
      setServerTime(data.serverTime || '');
    } catch (err: any) {
      setError(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchBookings = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch(`/api/bookings?studentId=${STUDENT_ID}`);
      if (!res.ok) throw new Error('Failed to load your booked slots');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your booked slots');
    } finally {
      setLoadingBookings(false);
      if (!isSilent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReleases(false);
    fetchBookings(true);
  }, [fetchBookings, fetchReleases]);

  const handleBookSlot = (slot: Slot, release: ReleaseWithSlots) => {
    setSelectedSlot(slot);
    setSelectedRelease(release);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (params: {
    slotId: string;
    bookingRole?: 'solver' | 'shadow';
    cvHrSelection?: CvHrOption;
  }) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        studentId: STUDENT_ID,
        studentName: STUDENT_NAME,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to complete booking');
    }

    // Refresh releases so the slot appears booked
    await Promise.all([fetchReleases(true), fetchBookings(true)]);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Student Portal Academic Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Junior Batch Mentorship & SIP
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">IIM Lucknow Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Mentoring Slots</h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Browse upcoming releases or review the mentoring slots you have reserved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => activeView === 'upcoming' ? fetchReleases(false) : fetchBookings()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : activeView === 'upcoming' ? 'Refresh Slots' : 'Refresh Bookings'}</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900">How Scheduled Slot Release Works:</strong> All slots
            in a release become bookable concurrently at the mentor's designated release time. If
            you arrive before release, watch the countdown. As soon as the countdown hits zero,
            refresh to see the <strong>BOOK NOW</strong> buttons activate.
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="Mentoring slot views" className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-lg">
        <button
          type="button"
          role="tab"
          id="upcoming-tab"
          aria-controls="upcoming-panel"
          aria-selected={activeView === 'upcoming'}
          onClick={() => setActiveView('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${activeView === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Upcoming <span className="ml-1.5 text-[11px] text-slate-500">{releases.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          id="booked-tab"
          aria-controls="booked-panel"
          aria-selected={activeView === 'booked'}
          onClick={() => setActiveView('booked')}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${activeView === 'booked' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Booked Slots <span className="ml-1.5 text-[11px] text-slate-500">{bookings.length}</span>
        </button>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => activeView === 'upcoming' ? fetchReleases(false) : fetchBookings()}
            className="text-xs font-bold underline hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {activeView === 'booked' ? (
        <section id="booked-panel" role="tabpanel" aria-labelledby="booked-tab" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loadingBookings ? (
            <p className="px-6 py-5 text-sm text-slate-500">Loading booked slots...</p>
          ) : bookings.length === 0 ? (
            <p className="px-6 py-5 text-sm text-slate-500">You have no booked slots yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <article key={booking._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{booking.title || 'Mentoring Session'}</h2>
                    <p className="text-xs text-slate-500 mt-1">Mentor: {booking.mentorName}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-semibold text-slate-800">{booking.startTime} – {booking.endTime}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {booking.mode} · {booking.slotType === 'case'
                        ? booking.bookingRole === 'solver' ? 'Solver' : 'Shadow'
                        : booking.cvHrSelection || 'CV / HR'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div id="upcoming-panel" role="tabpanel" aria-labelledby="upcoming-tab">
          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-6 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-28 bg-slate-100 rounded-xl border border-slate-200" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : releases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Mentoring Releases Scheduled</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                There are currently no scheduled mentoring sessions. Switch to the mentor profile to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {releases.map((release) => (
                <ReleaseCard
                  key={release._id}
                  release={release}
                  onBookSlot={handleBookSlot}
                  onRefresh={() => fetchReleases(true)}
                  currentStudentId={STUDENT_ID}
                  currentStudentName={STUDENT_NAME}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <BookingModal
        slot={selectedSlot}
        releaseTitle={selectedRelease?.title}
        mentorName={selectedRelease?.mentorName}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
          setSelectedRelease(null);
        }}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
}

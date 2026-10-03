'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ReleaseWithSlots, Slot } from '@/models/types';
import { ReleaseCard } from '@/components/ReleaseCard';
import { DemoBookingModal } from '@/components/DemoBookingModal';
import { RefreshCw, Sparkles, AlertCircle, Info, Calendar } from 'lucide-react';

export default function StudentPage() {
  const [releases, setReleases] = useState<ReleaseWithSlots[]>([]);
  const [serverTime, setServerTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => {
    fetchReleases(false);
  }, [fetchReleases]);

  const handleBookSlot = (slot: Slot, release: ReleaseWithSlots) => {
    setSelectedSlot(slot);
    setSelectedRelease(release);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (slotId: string) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId,
        studentId: 'student_vaibhav',
        studentName: 'Vaibhav Raj Sahni',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to complete booking');
    }

    // Refresh releases so the slot appears booked
    fetchReleases(true);
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Mentoring Releases
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Mentoring and SIP consultation slots are released at predetermined, scheduled times.
              Slots remain locked until their exact release timestamp. Refresh this page once the countdown completes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => fetchReleases(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Checking Server...' : 'Refresh Slots Status'}</span>
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

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchReleases(false)}
            className="text-xs font-bold underline hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
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
            There are currently no scheduled mentoring sessions. Use the Demo Controls below to seed
            a sample session or switch to Mentor view to schedule one.
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
            />
          ))}
        </div>
      )}

      {/* Booking Flow Simulated Modal */}
      <DemoBookingModal
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

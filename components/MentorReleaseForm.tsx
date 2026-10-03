'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentISTParts, formatToIST, formatTimeIST, formatDateIST, istToUtcIso } from '@/lib/time-utils';
import { Plus, Trash2, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles, MapPin } from 'lucide-react';

interface SlotDraft {
  id: string;
  startTime: string;
  endTime: string;
  mode: string;
  note: string;
}

export const MentorReleaseForm: React.FC = () => {
  const router = useRouter();

  // Session fields
  const [title, setTitle] = useState('Consulting Case Preparation');
  const [description, setDescription] = useState(
    'Practice case interviews, discuss problem-solving frameworks, and receive structured feedback for upcoming management consulting SIP selections.'
  );
  const [mentorName, setMentorName] = useState('Rahul Sharma');
  const [category, setCategory] = useState('Management Consulting');

  // Initial release schedule: 3 minutes from now in IST
  const initialSchedule = getCurrentISTParts(3);
  const [releaseDate, setReleaseDate] = useState(initialSchedule.date);
  const [releaseTime, setReleaseTime] = useState(initialSchedule.time);

  // Slots array
  const [slots, setSlots] = useState<SlotDraft[]>([
    { id: '1', startTime: '03:00 PM', endTime: '03:30 PM', mode: 'Online (Google Meet)', note: 'Case 1: Profitability & Market Entry' },
    { id: '2', startTime: '03:30 PM', endTime: '04:00 PM', mode: 'Online (Google Meet)', note: 'Case 2: M&A / Pricing' },
    { id: '3', startTime: '04:00 PM', endTime: '04:30 PM', mode: 'Online (Google Meet)', note: 'Case 3: Unconventional Problem Solving' },
    { id: '4', startTime: '04:30 PM', endTime: '05:00 PM', mode: 'Online (Google Meet)', note: 'Case 4: Frameworks & CV walkthrough' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    id: string;
    title: string;
    releaseAt: string;
    slotCount: number;
  } | null>(null);

  // Slot handlers
  const addSlot = () => {
    const nextId = String(Date.now());
    // Guess sensible next time
    const lastSlot = slots[slots.length - 1];
    let nextStart = '05:00 PM';
    let nextEnd = '05:30 PM';
    if (lastSlot) {
      nextStart = lastSlot.endTime;
    }
    setSlots([
      ...slots,
      {
        id: nextId,
        startTime: nextStart,
        endTime: nextEnd,
        mode: 'Online (Google Meet)',
        note: '',
      },
    ]);
  };

  const removeSlot = (id: string) => {
    if (slots.length <= 1) {
      setError('A release must contain at least 1 slot.');
      return;
    }
    setError(null);
    setSlots(slots.filter((s) => s.id !== id));
  };

  const updateSlot = (id: string, field: keyof SlotDraft, value: string) => {
    setSlots(
      slots.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Quick schedule presets
  const setQuickTime = (minutesAhead: number) => {
    const parts = getCurrentISTParts(minutesAhead);
    setReleaseDate(parts.date);
    setReleaseTime(parts.time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!title.trim()) {
      setError('Please provide a session title.');
      return;
    }
    if (!mentorName.trim()) {
      setError('Please enter the mentor name.');
      return;
    }
    if (!releaseDate || !releaseTime) {
      setError('Please provide both release date and time.');
      return;
    }
    if (slots.length === 0) {
      setError('At least one slot is required.');
      return;
    }

    // Validate slots
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i].startTime.trim() || !slots[i].endTime.trim()) {
        setError(`Slot #${i + 1} is missing start or end time.`);
        return;
      }
    }

    // Compute UTC ISO for releaseAt
    let releaseAtUtc: string;
    try {
      releaseAtUtc = istToUtcIso(releaseDate, releaseTime);
    } catch {
      setError('Invalid date or time format.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          mentorName: mentorName.trim(),
          category: category.trim(),
          releaseAt: releaseAtUtc,
          slots: slots.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            mode: s.mode,
            note: s.note,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create scheduled release');
      }

      setSuccessData({
        id: data.release._id,
        title: data.release.title,
        releaseAt: data.release.releaseAt,
        slotCount: slots.length,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the release.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto my-8 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Release Scheduled Successfully
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{successData.title}</h2>
          <p className="text-base text-slate-700 max-w-md mx-auto">
            Students can book these {successData.slotCount} slots from{' '}
            <strong className="text-slate-900 font-semibold">
              {formatTimeIST(successData.releaseAt)} on {formatDateIST(successData.releaseAt)} (IST)
            </strong>
            .
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-w-lg mx-auto text-left space-y-1.5">
          <div className="font-semibold text-slate-800">What happens next?</div>
          <ul className="list-disc pl-4 space-y-1 text-slate-600">
            <li>Before the scheduled time, the slots will appear as locked on the student portal.</li>
            <li>At or after the scheduled time, refreshing the page will unlock the "Book Now" buttons.</li>
            <li>You can also manually release the slots ahead of time from your releases dashboard.</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/mentor/releases"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            View in Scheduled Releases
          </Link>
          <Link
            href="/student"
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            Preview Student View
          </Link>
          <button
            onClick={() => {
              setSuccessData(null);
              // reset time to +5 mins
              setQuickTime(5);
            }}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            Create Another Release
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Please check your inputs:</strong>
            {error}
          </div>
        </div>
      )}

      {/* SECTION 1: Session Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">1. Session Details</h3>
          <p className="text-xs text-slate-500">Provide mentoring session title, mentor identity, and guidance.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Session / Topic Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Consulting Case Preparation"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Mentor Name *
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Management Consulting, SIP Mentoring"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Session Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the focus of the session, prerequisites, and what students can expect..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Slot Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">2. Individual Slots ({slots.length})</h3>
            <p className="text-xs text-slate-500">
              Each slot will be displayed as an individual card for junior batch students to book.
            </p>
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Slot
          </button>
        </div>

        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center gap-3 relative group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                #{index + 1}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Start Time</label>
                  <input
                    type="text"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                    placeholder="03:00 PM"
                    required
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">End Time</label>
                  <input
                    type="text"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                    placeholder="03:30 PM"
                    required
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Mode / Room</label>
                  <input
                    type="text"
                    value={slot.mode}
                    onChange={(e) => updateSlot(slot.id, 'mode', e.target.value)}
                    placeholder="Online (Meet) or Room"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Slot Note</label>
                  <input
                    type="text"
                    value={slot.note}
                    onChange={(e) => updateSlot(slot.id, 'note', e.target.value)}
                    placeholder="Topic / Focus"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeSlot(slot.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end md:self-center"
                title="Remove Slot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Release Scheduling */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-6 space-y-5 ring-1 ring-blue-500/10">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">3. Release Scheduling</h3>
            <p className="text-xs text-slate-500">
              Set the exact date and time when all slots in this session become bookable.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            IST (Asia/Kolkata)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Release Date (IST) *
            </label>
            <div className="relative">
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Release Time (IST) *
            </label>
            <div className="relative">
              <input
                type="time"
                value={releaseTime}
                onChange={(e) => setReleaseTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quick presets for testing/interview */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setQuickTime(2)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium transition-colors"
          >
            +2 mins from now
          </button>
          <button
            type="button"
            onClick={() => setQuickTime(5)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium transition-colors"
          >
            +5 mins from now
          </button>
          <button
            type="button"
            onClick={() => setQuickTime(15)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium transition-colors"
          >
            +15 mins from now
          </button>
        </div>

        {/* Policy note */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Automated Guarantee:</strong> "Students will be able to book these slots only
            after the scheduled release time." All {slots.length} slots will unlock simultaneously.
            You can still manually release or cancel before the scheduled time if needed.
          </div>
        </div>
      </div>

      {/* Submit CTA */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Link
          href="/mentor/releases"
          className="px-5 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {loading ? 'Scheduling...' : 'SCHEDULE RELEASE'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

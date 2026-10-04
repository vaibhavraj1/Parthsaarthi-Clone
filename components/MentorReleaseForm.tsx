'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCurrentISTParts,
  formatToIST,
  formatTimeIST,
  formatDateIST,
  istToUtcIso,
  timeToMinutes,
  minutesToTime,
  doTimesOverlap,
} from '@/lib/time-utils';
import { TimeSelect } from './TimeSelect';
import { SlotType, SlotMode } from '@/models/types';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  Users,
  Briefcase,
  Sliders,
} from 'lucide-react';

interface FormSlot {
  id: string;
  startTime: string; // "14:00"
  endTime: string;   // "14:30"
  mode: SlotMode;
  slotType: SlotType;
  shadowCount: number; // for case slots (default 2)
}

export const MentorReleaseForm: React.FC = () => {
  const router = useRouter();

  // 1. Mentor Profile
  const mentorName = 'Gayathri Arvind';
  const [title, setTitle] = useState('Mentorship Session by Gayathri Arvind');

  // 2. Step 1: Batch Slot Generation Parameters
  const [genStartTime, setGenStartTime] = useState('14:00');
  const [genEndTime, setGenEndTime] = useState('16:00');
  const [genDuration, setGenDuration] = useState<number>(30); // 30 mins
  const [genMode, setGenMode] = useState<SlotMode>('Online');
  const [genSlotType, setGenSlotType] = useState<SlotType>('case');
  const [genShadowCount, setGenShadowCount] = useState<number>(2);

  // 3. Generated Slots
  const [slots, setSlots] = useState<FormSlot[]>([]);

  // Function to generate slots based on Step 1 parameters
  const generateSlotsList = (
    start: string,
    end: string,
    duration: number,
    mode: SlotMode,
    type: SlotType,
    shadows: number
  ) => {
    const startMins = timeToMinutes(start);
    const endMins = timeToMinutes(end);

    if (endMins <= startMins || duration <= 0) {
      return [];
    }

    const count = Math.floor((endMins - startMins) / duration);
    const newSlots: FormSlot[] = [];

    for (let i = 0; i < count; i++) {
      const slotStart = startMins + i * duration;
      const slotEnd = slotStart + duration;
      newSlots.push({
        id: `slot_${Date.now()}_${i}`,
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
        mode: mode,
        slotType: type,
        shadowCount: shadows,
      });
    }

    return newSlots;
  };

  // Generate initial slots on component mount
  useEffect(() => {
    const initial = generateSlotsList(
      '14:00',
      '16:00',
      30,
      'Online',
      'case',
      2
    );
    setSlots(initial);
  }, []);

  const handleRegenerateSlots = () => {
    const generated = generateSlotsList(
      genStartTime,
      genEndTime,
      genDuration,
      genMode,
      genSlotType,
      genShadowCount
    );
    if (generated.length === 0) {
      setError('Till Time must be greater than From Time by at least the per-slot duration.');
      return;
    }
    setError(null);
    setSlots(generated);
  };

  // 4. Release Timing Options
  const [releaseOption, setReleaseOption] = useState<'now' | 'scheduled'>('scheduled');
  const initialSchedule = getCurrentISTParts(15);
  const [currentIST, setCurrentIST] = useState(() => getCurrentISTParts(0, false));
  const [releaseDate, setReleaseDate] = useState(initialSchedule.date);
  const [releaseTime, setReleaseTime] = useState(initialSchedule.time);
  const nextReleaseSchedule = useMemo(() => {
    const nextMinutes = Math.floor(timeToMinutes(currentIST.time) / 5) * 5 + 5;
    if (nextMinutes >= 24 * 60) {
      return { ...getCurrentISTParts(24 * 60, false), time: '00:00' };
    }
    return { date: currentIST.date, time: minutesToTime(nextMinutes) };
  }, [currentIST]);

  useEffect(() => {
    const updateClock = () => setCurrentIST(getCurrentISTParts(0, false));
    const interval = setInterval(updateClock, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (releaseDate < currentIST.date) {
      setReleaseDate(currentIST.date);
      setReleaseTime(nextReleaseSchedule.time);
      return;
    }
    if (releaseDate === currentIST.date && nextReleaseSchedule.date !== currentIST.date) {
      setReleaseDate(nextReleaseSchedule.date);
      setReleaseTime(nextReleaseSchedule.time);
      return;
    }
    if (
      releaseDate === currentIST.date &&
      timeToMinutes(releaseTime) < timeToMinutes(nextReleaseSchedule.time)
    ) {
      setReleaseTime(nextReleaseSchedule.time);
    }
  }, [currentIST.date, nextReleaseSchedule, releaseDate, releaseTime]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    id: string;
    title: string;
    releaseAt: string;
    slotCount: number;
    status: string;
  } | null>(null);

  // Manual slot modifiers
  const handleUpdateSlot = (id: string, field: keyof FormSlot, value: any) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveSlot = (id: string) => {
    if (slots.length <= 1) {
      setError('A release must contain at least 1 slot.');
      return;
    }
    setError(null);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddIndividualSlot = () => {
    setError(null);
    let nextStart = '16:00';
    let nextEnd = '16:30';
    if (slots.length > 0) {
      const last = slots[slots.length - 1];
      nextStart = last.endTime;
      const endMins = timeToMinutes(nextStart) + 30;
      nextEnd = minutesToTime(endMins);
    }

    setSlots((prev) => [
      ...prev,
      {
        id: `slot_custom_${Date.now()}`,
        startTime: nextStart,
        endTime: nextEnd,
        mode: genMode,
        slotType: genSlotType,
        shadowCount: genShadowCount,
      },
    ]);
  };

  // Overlap and validation computation
  const overlapError = useMemo(() => {
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (timeToMinutes(s.startTime) >= timeToMinutes(s.endTime)) {
        return `Slot #${i + 1} (${s.startTime} – ${s.endTime}): End time must be after start time.`;
      }
      for (let j = 0; j < i; j++) {
        const prev = slots[j];
        if (doTimesOverlap(s.startTime, s.endTime, prev.startTime, prev.endTime)) {
          return `Conflict detected: Slot #${i + 1} (${s.startTime} – ${s.endTime}) overlaps with Slot #${j + 1} (${prev.startTime} – ${prev.endTime}).`;
        }
      }
    }
    return null;
  }, [slots]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (slots.length === 0) {
      setError('At least one slot is required in the release.');
      return;
    }

    if (overlapError) {
      setError(overlapError);
      return;
    }

    let releaseAtUtc: string | undefined = undefined;

    if (releaseOption === 'scheduled') {
      if (!releaseDate || !releaseTime) {
        setError('Please select both a release date and release time.');
        return;
      }

      // Check minima: cannot be in the past
      const todayIST = getCurrentISTParts(0).date;
      if (releaseDate < todayIST) {
        setError('Release date cannot be in the past.');
        return;
      }

      if (releaseDate === todayIST) {
        const nowISTTime = getCurrentISTParts(0, false).time;
        if (timeToMinutes(releaseTime) <= timeToMinutes(nowISTTime)) {
          setError(
            `For releases scheduled today, release time must be in the future (after current IST ${nowISTTime}).`
          );
          return;
        }
      }

      try {
        releaseAtUtc = istToUtcIso(releaseDate, releaseTime);
      } catch {
        setError('Invalid date or time format.');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Mentorship Release by Gayathri Arvind',
          mentorName: mentorName,
          releaseOption,
          releaseAt: releaseAtUtc,
          slots: slots.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            mode: s.mode,
            slotType: s.slotType,
            ...(s.slotType === 'case' ? { shadowCount: Number(s.shadowCount) } : {}),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create release');
      }

      setSuccessData({
        id: data.release._id,
        title: data.release.title,
        releaseAt: data.release.releaseAt,
        slotCount: slots.length,
        status: data.release.status,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the release.');
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
            {successData.status === 'open' ? 'Released Immediately' : 'Release Scheduled Successfully'}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{successData.title}</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {successData.status === 'open' ? (
              <>
                All <strong>{successData.slotCount} slots</strong> are now live and immediately bookable on the student portal.
              </>
            ) : (
              <>
                Students will be able to book these <strong>{successData.slotCount} slots</strong> on{' '}
                <strong className="text-slate-900">
                  {formatDateIST(successData.releaseAt)} at {formatTimeIST(successData.releaseAt)} IST
                </strong>
                .
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/mentor/releases"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Go to My Releases
          </Link>
          <Link
            href="/student"
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            View as Student (PGP42)
          </Link>
          <button
            onClick={() => {
              setSuccessData(null);
            }}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            Release Another Batch
          </button>
        </div>
      </div>
    );
  }

  const todayStr = currentIST.date;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title & Mentor Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Mentor Slot Release
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Release Mentoring Slots
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Mentor:</span>
            <span className="text-xs font-bold text-slate-900 font-mono">{mentorName}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Consulting & CV Preparation"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Please check:</strong>
            {error}
          </div>
        </div>
      )}

      {/* SECTION 1: Batch Slot Generation */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-2xs p-6 space-y-5 ring-1 ring-blue-500/10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-700" />
              1. Slot Auto-Generation Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your window and slot duration. Slots are automatically created and can be individually edited below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRegenerateSlots}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Generate Slots
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              From Time (24h)
            </label>
            <TimeSelect
              value={genStartTime}
              onChange={(val) => setGenStartTime(val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Till Time (24h)
            </label>
            <TimeSelect
              value={genEndTime}
              onChange={(val) => setGenEndTime(val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Per Slot Duration
            </label>
            <select
              value={genDuration}
              onChange={(e) => setGenDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              {Array.from({ length: 11 }, (_, index) => (index + 2) * 5).map((duration) => (
                <option key={duration} value={duration}>{duration} minutes</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Default Mode
            </label>
            <select
              value={genMode}
              onChange={(e) => setGenMode(e.target.value as SlotMode)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="Online">Online (Google Meet)</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Default Slot Type
            </label>
            <select
              value={genSlotType}
              onChange={(e) => setGenSlotType(e.target.value as SlotType)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="case">Case Slot (1 Solver + Shadows)</option>
              <option value="cv_hr">CV / HR Slot (1-on-1 Focus)</option>
            </select>
          </div>
        </div>

        {/* Dynamic options depending on slot type */}
        {genSlotType === 'case' ? (
          <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-blue-950">
                Shadow Count per Case Slot
              </label>
              <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-medium">
                Solver count is always 1
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="number"
                min={0}
                max={15}
                value={genShadowCount}
                onChange={(e) => setGenShadowCount(Math.max(0, Math.min(15, Number(e.target.value))))}
                className="w-24 px-3 py-1.5 text-xs font-semibold border border-blue-300 rounded-lg bg-white"
              />
              <span className="text-xs text-slate-500">
                Number of shadow observers allowed per slot (0 to 15)
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* SECTION 2: Slot Review & Manual Editing */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              2. Individual Slots ({slots.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              You can manually change timings, mode, and slot type for each individual slot.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddIndividualSlot}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Slot
          </button>
        </div>

        {overlapError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{overlapError}</span>
          </div>
        )}

        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col lg:flex-row lg:items-center gap-3"
            >
              <div className="flex items-center justify-between lg:justify-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                  #{index + 1}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    slot.slotType === 'case'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {slot.slotType === 'case' ? 'Case Slot' : 'CV/HR Slot'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 flex-1">
                {/* Start Time */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Start Time
                  </label>
                  <TimeSelect
                    value={slot.startTime}
                    onChange={(val) => handleUpdateSlot(slot.id, 'startTime', val)}
                    className="w-full"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    End Time
                  </label>
                  <TimeSelect
                    value={slot.endTime}
                    onChange={(val) => handleUpdateSlot(slot.id, 'endTime', val)}
                    className="w-full"
                  />
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Mode
                  </label>
                  <select
                    value={slot.mode}
                    onChange={(e) => handleUpdateSlot(slot.id, 'mode', e.target.value as SlotMode)}
                    className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                {/* Slot Type */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Slot Type
                  </label>
                  <select
                    value={slot.slotType}
                    onChange={(e) => handleUpdateSlot(slot.id, 'slotType', e.target.value as SlotType)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="case">Case Slot</option>
                    <option value="cv_hr">CV/HR Slot</option>
                  </select>
                </div>

                {/* Type-specific parameter */}
                <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                  {slot.slotType === 'case' ? (
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                        Shadow Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={slot.shadowCount}
                        onChange={(e) =>
                          handleUpdateSlot(slot.id, 'shadowCount', Math.max(0, Math.min(15, Number(e.target.value))))
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  ) : <div className="text-[11px] text-slate-400">Student selects focus when booking</div>}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveSlot(slot.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end lg:self-center"
                title="Remove Slot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Release Timing (Instant vs Scheduled) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              3. Release Timing Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose whether to release these slots immediately or schedule them for a future date & time.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            IST (Asia/Kolkata)
          </span>
        </div>

        {/* 2 Radio Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              releaseOption === 'scheduled'
                ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="releaseOption"
              value="scheduled"
              checked={releaseOption === 'scheduled'}
              onChange={() => setReleaseOption('scheduled')}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Schedule Release (Recommended)
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Slots will remain locked with a live countdown and automatically unlock at the designated release time.
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              releaseOption === 'now'
                ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="releaseOption"
              value="now"
              checked={releaseOption === 'now'}
              onChange={() => setReleaseOption('now')}
              className="mt-1 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Release Now (Instant)
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Releases immediately upon creation. Slots become bookable without waiting for a countdown.
              </p>
            </div>
          </label>
        </div>

        {/* Schedule Inputs (when scheduled is selected) */}
        {releaseOption === 'scheduled' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Release Date (Calendar) *
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Release Time (24h Clock, 5m Interval) *
                </label>
                <TimeSelect
                  value={releaseTime}
                  onChange={(val) => setReleaseTime(val)}
                  minTime={releaseDate === todayStr
                    ? nextReleaseSchedule.date === todayStr ? nextReleaseSchedule.time : '24:00'
                    : undefined}
                  className="w-full"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Configured for: <strong>{releaseDate} at {releaseTime} IST</strong>.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Link
          href="/mentor/releases"
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading || Boolean(overlapError)}
          className="px-7 py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {loading ? 'Processing...' : releaseOption === 'now' ? 'RELEASE NOW' : 'SCHEDULE RELEASE'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

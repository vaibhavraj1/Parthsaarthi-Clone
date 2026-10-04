'use client';

import React from 'react';
import { Slot } from '@/models/types';
import { Clock, Lock, CheckCircle2, MapPin, Sparkles, User, Users } from 'lucide-react';

interface SlotCardProps {
  slot: Slot;
  isBookable: boolean;
  onBookNow: (slot: Slot) => void;
  releaseTimeDisplay?: string;
  currentStudentId?: string;
  currentStudentName?: string;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  isBookable,
  onBookNow,
  releaseTimeDisplay,
  currentStudentId = 'student_vaibhav',
  currentStudentName = 'Vaibhav Raj Sahni',
}) => {
  const isCase = slot.slotType === 'case';
  const shadowCount = slot.shadowCount ?? 0;
  const currentShadows = slot.shadowsBooked || [];
  const shadowsLeft = Math.max(0, shadowCount - currentShadows.length);

  // Check if current student booked this slot
  const isUserSolver = slot.solverStudentId === currentStudentId;
  const isUserShadow = currentShadows.some((s) => s.studentId === currentStudentId);
  const isUserCvHr = slot.bookedStudentId === currentStudentId ||
    (slot.isBooked && slot.bookedBy === currentStudentName);
  const isUserBooked = isUserSolver || isUserShadow || isUserCvHr;

  // Check if slot has open capacity
  let isFull = false;
  if (isCase) {
    const solverFull = Boolean(slot.solverBooked);
    const shadowsFull = shadowCount > 0 ? shadowsLeft === 0 : true;
    isFull = solverFull && shadowsFull;
  } else {
    isFull = Boolean(slot.isBooked);
  }

  return (
    <div
      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
        isUserBooked
          ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
          : isFull
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : isBookable
          ? 'bg-white border-blue-200 shadow-sm hover:border-blue-400 hover:shadow-md ring-1 ring-blue-500/10'
          : 'bg-slate-50/80 border-slate-200 text-slate-500'
      }`}
    >
      <div>
        {/* Header time and status tag */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 font-mono">
            <Clock className={`w-4 h-4 ${isBookable && !isFull ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>
              {slot.startTime} – {slot.endTime}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isCase
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isCase ? 'Case' : 'CV/HR'}
            </span>
          </div>
        </div>

        {/* Mode and details */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{slot.mode || 'Online'}</span>
          </div>

          {/* Breakdown for Case Slots */}
          {isCase ? (
            <div className="pt-1 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Solver (1 spot):</span>
                <span
                  className={`font-semibold ${
                    slot.solverBooked ? 'text-slate-400 line-through' : 'text-emerald-700'
                  }`}
                >
                  {slot.solverBooked ? 'Filled' : 'Available'}
                </span>
              </div>
              {shadowCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Shadows ({shadowCount}):</span>
                  <span
                    className={`font-semibold ${
                      shadowsLeft === 0 ? 'text-slate-400' : 'text-emerald-700'
                    }`}
                  >
                    {shadowsLeft > 0 ? `${shadowsLeft} open` : 'Filled'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-1 text-[11px] text-slate-500">
              <span>Focus: </span>
              <span className="font-semibold text-slate-700">{slot.cvHrSelection || 'CV / HR Review'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Button CTA */}
      <div className="pt-2 border-t border-slate-100">
        {isUserBooked ? (
          <div className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
            {isUserSolver ? 'Booked as Solver' : isUserShadow ? 'Booked as Shadow' : 'You Booked Slot'}
          </div>
        ) : isFull ? (
          <button
            disabled
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Slot Filled
          </button>
        ) : isBookable ? (
          <button
            onClick={() => onBookNow(slot)}
            className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            BOOK NOW
          </button>
        ) : (
          <button
            disabled
            title={releaseTimeDisplay ? `Opens at ${releaseTimeDisplay}` : 'Locked until release'}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-200/80 text-slate-400 border border-slate-300/60 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            BOOK NOW (LOCKED)
          </button>
        )}
      </div>
    </div>
  );
};

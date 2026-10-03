'use client';

import React from 'react';
import { Slot } from '@/models/types';
import { Clock, Lock, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

interface SlotCardProps {
  slot: Slot;
  isBookable: boolean;
  onBookNow: (slot: Slot) => void;
  releaseTimeDisplay?: string;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  isBookable,
  onBookNow,
  releaseTimeDisplay,
}) => {
  const isBooked = Boolean(slot.isBooked);

  return (
    <div
      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
        isBooked
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : isBookable
          ? 'bg-white border-blue-200 shadow-sm hover:border-blue-400 hover:shadow-md ring-1 ring-blue-500/10'
          : 'bg-slate-50/80 border-slate-200 text-slate-500'
      }`}
    >
      <div>
        {/* Header time and status tag */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Clock className={`w-4 h-4 ${isBookable && !isBooked ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>
              {slot.startTime} – {slot.endTime}
            </span>
          </div>

          {isBooked ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
              Booked
            </span>
          ) : isBookable ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/80 text-slate-600 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              Locked
            </span>
          )}
        </div>

        {/* Details & Location */}
        <div className="space-y-1 text-xs text-slate-600 mb-4">
          {slot.mode && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{slot.mode}</span>
            </div>
          )}
          {slot.note && (
            <p className="text-slate-600 italic bg-white/60 p-1.5 rounded border border-slate-200/60 line-clamp-2">
              "{slot.note}"
            </p>
          )}
        </div>
      </div>

      {/* Button CTA */}
      <div className="pt-2 border-t border-slate-100">
        {isBooked ? (
          <button
            disabled
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Slot Booked
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

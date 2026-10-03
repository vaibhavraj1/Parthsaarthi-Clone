'use client';

import React from 'react';
import { ReleaseWithSlots, Slot } from '@/models/types';
import { SlotCard } from './SlotCard';
import { Countdown } from './Countdown';
import { StatusBadge } from './StatusBadge';
import { formatTimeIST, formatDateIST } from '@/lib/time-utils';
import { User, Sparkles, RefreshCw, Calendar, Info, Layers } from 'lucide-react';

interface ReleaseCardProps {
  release: ReleaseWithSlots;
  onBookSlot: (slot: Slot, release: ReleaseWithSlots) => void;
  onRefresh?: () => void;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  onBookSlot,
  onRefresh,
}) => {
  const isBookable = release.isBookable;
  const releaseTimeDisplay = formatTimeIST(release.releaseAt);
  const releaseDateDisplay = formatDateIST(release.releaseAt);
  const slotCount = release.slots?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden">
      {/* Session Header Card */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {release.category || 'Mentoring Session'}
              </span>
              <StatusBadge status={release.computedStatus} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {release.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <User className="w-4 h-4 text-slate-500" />
                Mentor: {release.mentorName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                {slotCount} {slotCount === 1 ? 'slot' : 'slots'} available
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                Scheduled for {releaseDateDisplay}
              </span>
            </div>
          </div>

          {/* Release status / Countdown callout */}
          <div className="flex flex-col items-start md:items-end justify-center gap-1.5">
            {isBookable ? (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left md:text-right">
                  <div className="text-xs font-bold uppercase tracking-wider">BOOKING OPEN</div>
                  <div className="text-[11px] text-emerald-700">Released at {releaseTimeDisplay} IST</div>
                </div>
              </div>
            ) : release.computedStatus === 'cancelled' ? (
              <div className="px-3.5 py-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider">
                Release Cancelled by Mentor
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col items-start md:items-end">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Slots release at{' '}
                  <span className="font-bold text-slate-900">{releaseTimeDisplay} IST</span>
                </div>
                <Countdown
                  releaseAt={release.releaseAt}
                  onTimeReached={() => {
                    if (onRefresh) onRefresh();
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {release.description && (
          <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
            {release.description}
          </p>
        )}

        {/* Visual status banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-medium">
            {isBookable ? (
              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                SLOTS UNLOCKED — SELECT A SLOT BELOW TO BOOK
              </span>
            ) : (
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                LOCKED — BOOKING OPENS AT {releaseTimeDisplay} IST
              </span>
            )}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
              title="Refresh server state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Status</span>
            </button>
          )}
        </div>
      </div>

      {/* Individual Slot Cards Grid */}
      <div className="p-6 bg-slate-50/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Available Slot Times ({slotCount})
        </h3>
        {slotCount === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            No slots attached to this release.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {release.slots.map((slot) => (
              <SlotCard
                key={slot._id}
                slot={slot}
                isBookable={isBookable}
                releaseTimeDisplay={releaseTimeDisplay}
                onBookNow={(s) => onBookSlot(s, release)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { calculateRemainingTime } from '@/lib/time-utils';
import { Clock, RefreshCw } from 'lucide-react';

interface CountdownProps {
  releaseAt: string;
  onTimeReached?: () => void;
  className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({ releaseAt, onTimeReached, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateRemainingTime(releaseAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemainingTime(releaseAt);
      setTimeLeft(remaining);

      if (remaining.isPassed) {
        clearInterval(timer);
        if (onTimeReached) {
          onTimeReached();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseAt, onTimeReached]);

  if (timeLeft.isPassed) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Scheduled release time reached!</span>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1 ml-2 text-xs font-semibold underline text-emerald-900 hover:text-emerald-700 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          Refresh to Book
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg shadow-sm border border-slate-700 font-mono ${className}`}>
      <Clock className="w-4 h-4 text-amber-400" />
      <span className="text-xs uppercase tracking-wider text-slate-300 font-sans font-medium">
        Releases in:
      </span>
      <span className="text-base font-bold tracking-widest text-amber-300">
        {timeLeft.formatted}
      </span>
    </div>
  );
};

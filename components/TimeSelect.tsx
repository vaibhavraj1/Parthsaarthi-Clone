'use client';

import React, { useMemo } from 'react';
import { generate24HourTimeOptions, timeToMinutes } from '@/lib/time-utils';

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  minTime?: string; // Optional: only show times >= minTime
  maxTime?: string; // Optional: only show times <= maxTime
  stepMinutes?: number; // default 5
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const TimeSelect: React.FC<TimeSelectProps> = ({
  value,
  onChange,
  minTime,
  maxTime,
  stepMinutes = 5,
  disabled = false,
  className = '',
  required = false,
}) => {
  const allTimes = useMemo(() => {
    return generate24HourTimeOptions(stepMinutes);
  }, [stepMinutes]);

  const filteredTimes = useMemo(() => {
    let result = allTimes;
    if (minTime) {
      const minMins = timeToMinutes(minTime);
      result = result.filter((t) => timeToMinutes(t) >= minMins);
    }
    if (maxTime) {
      const maxMins = timeToMinutes(maxTime);
      result = result.filter((t) => timeToMinutes(t) <= maxMins);
    }
    return result;
  }, [allTimes, minTime, maxTime, value]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      className={`px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 disabled:opacity-50 disabled:bg-slate-100 transition-all ${className}`}
    >
      {filteredTimes.map((timeStr) => (
        <option key={timeStr} value={timeStr}>
          {timeStr}
        </option>
      ))}
    </select>
  );
};
